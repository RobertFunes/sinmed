// jobs/citasCleanup.js (node-cron)
// Depura citas con más de 6 meses de antigüedad (inicio_utc < NOW() - 6 meses)
// Ejecuta el día 1 de cada mes a las 03:00 hora de Ciudad de México.

const cron = require('node-cron');
const db = require('../models/db');

const RETENTION_MONTHS = 6; // fijo, sin ENV
const CRON_EXPR = '0 3 1 * *'; // 03:00 el día 1 de cada mes
const TIMEZONE = 'America/Mexico_City';

async function acquireLock() {
  try {
    const [rows] = await db.query("SELECT GET_LOCK('citas_cleanup_lock', 5) AS got");
    const v = rows?.[0]?.got;
    return v === 1 || v === '1';
  } catch (_) {
    return true; // si el lock no está disponible (p.ej. permisos), continuamos para no bloquear funcionalidad
  }
}

async function releaseLock() {
  try { await db.query("DO RELEASE_LOCK('citas_cleanup_lock')"); } catch (_) {}
}

async function deleteBatch(limit = 500) {
  // cutoff en SQL sobre NOW() del servidor
  const cutoffSql = `DATE_SUB(NOW(), INTERVAL ${RETENTION_MONTHS} MONTH)`;
  const sql = `DELETE FROM citas WHERE inicio_utc < ${cutoffSql} LIMIT ${limit}`;
  const [result] = await db.query(sql);
  return result?.affectedRows || 0;
}

async function runCleanup() {
  const started = Date.now();
  let total = 0;
  try {
    const got = await acquireLock();
    if (!got) {
      return { ok: false, skipped: true, reason: 'lock-not-acquired' };
    }
    while (true) {
      const n = await deleteBatch(500);
      if (!n) break;
      total += n;
      await new Promise((r) => setTimeout(r, 5));
    }
    return { ok: true, deleted: total, ms: Date.now() - started };
  } catch (err) {
    return { ok: false, error: err?.message || String(err), deleted: total };
  } finally {
    await releaseLock();
  }
}

function start() {
  try {
    const task = cron.schedule(CRON_EXPR, async () => {
      const res = await runCleanup();
      if (res?.ok) {
        console.log(`[citasCleanup] monthly run: deleted=${res.deleted} in ${res.ms}ms`);
      } else if (res?.skipped) {
        console.log(`[citasCleanup] monthly run skipped: ${res.reason}`);
      } else {
        console.warn(`[citasCleanup] monthly run error: ${res?.error || 'unknown'}`);
      }
    }, { timezone: TIMEZONE });
    // Inicia tarea
    task.start();
    console.log(`[citasCleanup] scheduled '${CRON_EXPR}' TZ=${TIMEZONE}`);
  } catch (e) {
    console.warn('[citasCleanup] schedule error:', e?.message || e);
  }
}

module.exports = { start, runCleanup };

