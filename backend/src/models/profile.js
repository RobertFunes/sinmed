const db = require('./db'); // 👈 Aquí importas la conexión

async function add(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Payload inválido para add(perfil)');
  }
  const [result] = await db.query('INSERT INTO perfil SET ?', [data]);
  return result?.insertId;
}

async function updatePerfil(id_perfil, data = {}) {
  const id = Number(id_perfil);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('id_perfil inválido');
  }
  const payload = { ...data };
  const [result] = await db.query('UPDATE perfil SET ? WHERE id_perfil = ?', [payload, id]);
  return result;
}

// Inserta N filas en antecedentes_familiares para un perfil dado
// items: array de objetos { nombre, descripcion? } ya normalizados ('' -> null)
async function addAntecedentesFamiliares(id_perfil, items = []) {
  if (!Array.isArray(items) || items.length === 0) return 0;
  let inserted = 0;
  for (const it of items) {
    const nombre = it?.nombre;
    if (!nombre) continue; // requiere nombre NOT NULL
    const descripcion = it?.descripcion ?? null;
    await db.query(
      'INSERT INTO antecedentes_familiares (id_perfil, nombre, descripcion) VALUES (?, ?, ?)',
      [id_perfil, nombre, descripcion]
    );
    inserted++;
  }
  return inserted;
}

async function replaceAntecedentesFamiliares(id_perfil, items = []) {
  if (!id_perfil) throw new Error('id_perfil requerido');
  await db.query('DELETE FROM antecedentes_familiares WHERE id_perfil = ?', [id_perfil]);
  return addAntecedentesFamiliares(id_perfil, items);
}

// Inserta/actualiza (1:1) antecedentes_personales por id_perfil
// data: objeto parcial con columnas válidas (sin id_perfil)
async function upsertAntecedentesPersonales(id_perfil, data = {}) {
  if (!id_perfil) throw new Error('id_perfil requerido');
  const payload = { ...data };

  // Filtra null/undefined para no sobrescribir con null innecesariamente
  const cols = Object.keys(payload).filter((k) => payload[k] != null);
  if (cols.length === 0) return { affectedRows: 0 };

  const fields = ['id_perfil', ...cols];
  const placeholders = fields.map(() => '?').join(', ');
  const values = [id_perfil, ...cols.map((k) => payload[k])];

  const updates = cols.map((k) => `${k}=VALUES(${k})`).join(', ');
  const sql = `INSERT INTO antecedentes_personales (${fields.join(', ')}) VALUES (${placeholders})
               ON DUPLICATE KEY UPDATE ${updates}`;
  const [result] = await db.query(sql, values);
  return result;
}

async function upsertGinecoObstetricos(id_perfil, data = {}) {
  if (!id_perfil) throw new Error('id_perfil requerido');
  const payload = { ...data };
  const cols = Object.keys(payload).filter((k) => payload[k] != null);
  if (cols.length === 0) return { affectedRows: 0 };
  const fields = ['id_perfil', ...cols];
  const placeholders = fields.map(() => '?').join(', ');
  const values = [id_perfil, ...cols.map((k) => payload[k])];
  const updates = cols.map((k) => `${k}=VALUES(${k})`).join(', ');
  const sql = `INSERT INTO gineco_obstetricos (${fields.join(', ')}) VALUES (${placeholders})
               ON DUPLICATE KEY UPDATE ${updates}`;
  const [result] = await db.query(sql, values);
  return result;
}

// Inserta N filas en antecedentes_personales_patologicos para un perfil dado
// items: array de objetos { antecedente, descripcion? } ya normalizados ('' -> null)
async function addAntecedentesPersonalesPatologicos(id_perfil, items = []) {
  if (!Array.isArray(items) || items.length === 0) return 0;
  let inserted = 0;
  for (const it of items) {
    const antecedente = it?.antecedente;
    if (!antecedente) continue; // requiere antecedente NOT NULL
    const descripcion = it?.descripcion ?? null;
    await db.query(
      'INSERT INTO antecedentes_personales_patologicos (id_perfil, antecedente, descripcion) VALUES (?, ?, ?)',
      [id_perfil, antecedente, descripcion]
    );
    inserted++;
  }
  return inserted;
}

async function replaceAntecedentesPersonalesPatologicos(id_perfil, items = []) {
  if (!id_perfil) throw new Error('id_perfil requerido');
  await db.query('DELETE FROM antecedentes_personales_patologicos WHERE id_perfil = ?', [id_perfil]);
  return addAntecedentesPersonalesPatologicos(id_perfil, items);
}

// Inserta/actualiza (1:1) exploracion_fisica por id_perfil
// data: objeto parcial con columnas válidas (sin id_perfil)
async function upsertExploracionFisica(id_perfil, data = {}) {
  if (!id_perfil) throw new Error('id_perfil requerido');
  const payload = { ...data };

  const cols = Object.keys(payload).filter((k) => payload[k] != null);
  if (cols.length === 0) return { affectedRows: 0 };

  const fields = ['id_perfil', ...cols];
  const placeholders = fields.map(() => '?').join(', ');
  const values = [id_perfil, ...cols.map((k) => payload[k])];

  const updates = cols.map((k) => `${k}=VALUES(${k})`).join(', ');
  const sql = `INSERT INTO exploracion_fisica (${fields.join(', ')}) VALUES (${placeholders})
               ON DUPLICATE KEY UPDATE ${updates}`;
  const [result] = await db.query(sql, values);
  return result;
}

// Inserta/actualiza (1:1) consultas por id_perfil
// data: objeto parcial con columnas válidas (sin id_perfil)
async function upsertConsultas(id_perfil, data = {}) {
  if (!id_perfil) throw new Error('id_perfil requerido');
  const payload = { ...data };

  const cols = Object.keys(payload).filter((k) => payload[k] != null);
  if (cols.length === 0) return { affectedRows: 0 };

  const fields = ['id_perfil', ...cols];
  const placeholders = fields.map(() => '?').join(', ');
  const values = [id_perfil, ...cols.map((k) => payload[k])];

  const updates = cols.map((k) => `${k}=VALUES(${k})`).join(', ');
  const sql = `INSERT INTO consultas (${fields.join(', ')}) VALUES (${placeholders})
               ON DUPLICATE KEY UPDATE ${updates}`;
  const [result] = await db.query(sql, values);
  return result;
}

async function replaceConsultas(id_perfil, items = []) {
  if (!id_perfil) throw new Error('id_perfil requerido');
  await db.query('DELETE FROM consultas WHERE id_perfil = ?', [id_perfil]);
  if (!Array.isArray(items) || items.length === 0) {
    return { inserted: 0 };
  }

  let inserted = 0;
  for (const raw of items) {
    if (!raw || typeof raw !== 'object') continue;
    const payload = { id_perfil, ...raw };
    const hasContent = Object.entries(payload).some(([key, value]) => (
      key !== 'id_perfil' && value != null && value !== ''
    ));
    if (!hasContent) continue;
    const [result] = await db.query('INSERT INTO consultas SET ?', [payload]);
    inserted += result?.affectedRows ?? 0;
  }

  return { inserted };
}
// Inserta/actualiza (1:1) diagnostico_tratamiento por id_perfil
// data: objeto parcial con columnas válidas (sin id_perfil)
async function upsertDiagnosticoTratamiento(id_perfil, data = {}) {
  if (!id_perfil) throw new Error('id_perfil requerido');
  const payload = { ...data };

  const cols = Object.keys(payload).filter((k) => payload[k] != null);
  if (cols.length === 0) return { affectedRows: 0 };

  const fields = ['id_perfil', ...cols];
  const placeholders = fields.map(() => '?').join(', ');
  const values = [id_perfil, ...cols.map((k) => payload[k])];

  const updates = cols.map((k) => `${k}=VALUES(${k})`).join(', ');
  const sql = `INSERT INTO diagnostico_tratamiento (${fields.join(', ')}) VALUES (${placeholders})
               ON DUPLICATE KEY UPDATE ${updates}`;
  const [result] = await db.query(sql, values);
  return result;
}



async function getSummary(limit = 50, offset = 0) {
  const summarySql = [
    'SELECT',
    '  p.id_perfil,',
    '  p.nombre,',
    '  p.telefono_movil,',
    '  CASE',
    '    WHEN p.fecha_nacimiento IS NULL THEN NULL',
    '    ELSE TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE())',
    '  END AS edad,',
    "  DATE_FORMAT(p.creado, '%Y-%m-%d') AS creado,",
    '  DATE_FORMAT(GREATEST(',
    "    COALESCE(p.actualizado,              CAST('1970-01-01' AS DATE)),",
    "    COALESCE(af.max_actualizado,         CAST('1970-01-01' AS DATE)),",
    "    COALESCE(ap.max_actualizado,         CAST('1970-01-01' AS DATE)),",
    "    COALESCE(app.max_actualizado,        CAST('1970-01-01' AS DATE)),",
    "    COALESCE(ef.max_actualizado,         CAST('1970-01-01' AS DATE)),",
    "    COALESCE(c.max_fecha_consulta,       CAST('1970-01-01' AS DATE))",
    "  ), '%Y-%m-%d') AS actualizado",
    'FROM perfil p',
    ' ',
    'LEFT JOIN (',
    '  SELECT id_perfil, MAX(actualizado) AS max_actualizado',
    '  FROM antecedentes_familiares',
    '  GROUP BY id_perfil',
    ') af ON af.id_perfil = p.id_perfil',
    ' ',
    'LEFT JOIN (',
    '  SELECT id_perfil, MAX(actualizado) AS max_actualizado',
    '  FROM antecedentes_personales',
    '  GROUP BY id_perfil',
    ') ap ON ap.id_perfil = p.id_perfil',
    ' ',
    'LEFT JOIN (',
    '  SELECT id_perfil, MAX(actualizado) AS max_actualizado',
    '  FROM antecedentes_personales_patologicos',
    '  GROUP BY id_perfil',
    ') app ON app.id_perfil = p.id_perfil',
    ' ',
    'LEFT JOIN (',
    '  SELECT id_perfil, MAX(actualizado) AS max_actualizado',
    '  FROM exploracion_fisica',
    '  GROUP BY id_perfil',
    ') ef ON ef.id_perfil = p.id_perfil',
    ' ',
    'LEFT JOIN (',
    '  SELECT id_perfil, MAX(fecha_consulta) AS max_fecha_consulta',
    '  FROM consultas',
    '  GROUP BY id_perfil',
    ') c ON c.id_perfil = p.id_perfil',
    'ORDER BY p.id_perfil DESC',
    'LIMIT ? OFFSET ?'
  ].join('\n');
  const [rows] = await db.query(summarySql, [limit, offset]);

  const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM perfil');
  return { rows, total };
}
// Obtiene un perfil completo con sus relaciones según el esquema NUEVO
async function getById(id_perfil) {
  const id = Number(id_perfil);
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, error: { code: 'BAD_REQUEST', message: 'id_perfil inválido' } };
  }

  // Perfil base
  const [pRows] = await db.query(
    'SELECT * FROM perfil WHERE id_perfil = ? LIMIT 1',
    [id]
  );
  const perfil = pRows?.[0];
  if (!perfil) {
    return { ok: false, error: { code: 'NOT_FOUND', message: 'Perfil no encontrado' } };
  }

  // Helpers de fecha
  const toYMD = (v) => {
    if (v == null) return v;
    if (v instanceof Date) {
      const y = v.getUTCFullYear();
      const m = String(v.getUTCMonth() + 1).padStart(2, '0');
      const d = String(v.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
    return v;
  };

  // Qué campos son fechas por tabla (para formatear YYYY-MM-DD)
  const DATE_KEYS = {
    perfil: new Set(['fecha_nacimiento', 'creado', 'actualizado']),
    antecedentes_familiares: new Set(['creado', 'actualizado']),
    antecedentes_personales: new Set(['creado', 'actualizado']),
    antecedentes_personales_patologicos: new Set(['creado', 'actualizado']),
    exploracion_fisica: new Set(['creado', 'actualizado']),
    // gineco no tiene timestamps, pero SÍ fechas clínicas
    gineco_obstetricos: new Set([
      'fecha_ultima_menstruacion',
      'fecha_ultimo_parto',
      'fecha_menopausia'
    ]),
    consultas: new Set(['fecha_consulta', 'recordatorio'])
  };

  const compactRow = (obj, scope = 'default') => {
    const out = {};
    const dateKeys = DATE_KEYS[scope] || new Set();
    for (const [k, v] of Object.entries(obj || {})) {
      const val = dateKeys.has(k) ? toYMD(v) : v;
      if (val != null && val !== '') out[k] = val;
    }
    return out;
  };

  const result = { ok: true, ...compactRow(perfil, 'perfil') };

  // 1:1
  {
    const [rows] = await db.query(
      'SELECT * FROM antecedentes_personales WHERE id_perfil = ? LIMIT 1',
      [id]
    );
    if (rows?.length) result.antecedentes_personales = compactRow(rows[0], 'antecedentes_personales');
  }

  {
    const [rows] = await db.query(
      'SELECT * FROM gineco_obstetricos WHERE id_perfil = ? LIMIT 1',
      [id]
    );
    if (rows?.length) result.gineco_obstetricos = compactRow(rows[0], 'gineco_obstetricos');
  }

  {
    // Por si no tienes UNIQUE(id_perfil) aún, tomamos la más reciente por actualizado si existiera; si no, por id
    const [rows] = await db.query(
      'SELECT * FROM exploracion_fisica WHERE id_perfil = ? ORDER BY actualizado DESC, id_exploracion DESC LIMIT 1',
      [id]
    );
    if (rows?.length) result.exploracion_fisica = compactRow(rows[0], 'exploracion_fisica');
  }

  // 1:N
  const includedDates = [];
  if (result.actualizado) includedDates.push(result.actualizado);

  const load1N = async (table, scope, orderBy) => {
    const [rows] = await db.query(
      `SELECT * FROM ${table} WHERE id_perfil = ? ${orderBy ? 'ORDER BY ' + orderBy : ''}`,
      [id]
    );
    if (Array.isArray(rows) && rows.length) {
      const items = rows.map(r => compactRow(r, scope)).filter(o => Object.keys(o).length > 0);
      if (items.length) {
        result[table] = items;
        // agrega candidatos para actualizado_max
        for (const it of items) {
          if (it.actualizado) includedDates.push(it.actualizado);
        }
      }
    }
  };

  await load1N('antecedentes_familiares', 'antecedentes_familiares', 'actualizado DESC, id_antecedente_familiar DESC');
  await load1N('antecedentes_personales_patologicos', 'antecedentes_personales_patologicos', 'actualizado DESC, id_app DESC');

  // consultas es 1:N; no tiene creado/actualizado, usamos fecha_consulta como "actividad"
  {
    const [rows] = await db.query(
      'SELECT * FROM consultas WHERE id_perfil = ? ORDER BY fecha_consulta DESC, id_consulta DESC',
      [id]
    );
    if (Array.isArray(rows) && rows.length) {
      const items = rows.map(r => compactRow(r, 'consultas'));
      result.consultas = items;
      for (const it of items) {
        if (it.fecha_consulta) includedDates.push(it.fecha_consulta);
      }
    }
  }

  // actualizado_max = lo más reciente entre p.actualizado, timestamps de 1:N y fecha_consulta
  const toDate = (s) => {
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d) ? null : d;
  };
  let max = null;
  for (const s of includedDates) {
    const d = toDate(s);
    if (d && (!max || d > max)) max = d;
  }
  if (max) result.actualizado_max = toYMD(max);

  return result;
}

// updateUltimaFechaContacto() eliminado (legacy basado en tabla `clientes`)

// Elimina el recordatorio asociado a una consulta específica
async function postponeContactDate(id_consulta) {
  const [result] = await db.query(
    'UPDATE consultas SET recordatorio = NULL WHERE id_consulta = ?',
    [id_consulta]
  );
  return result;
}

async function getPending() {
  /* 🇲🇽 NOW_MX = hora/fecha de México (UTC-6) */
  const [birthdays] = await db.query(`
    SELECT
      p.id_perfil        AS id,
      p.nombre           AS nombre,
      p.telefono_movil   AS telefono_movil,
      lc.ultima_fecha_contacto,
      CASE
        WHEN DATE_FORMAT(p.fecha_nacimiento,'%m-%d') >= DATE_FORMAT(CONVERT_TZ(NOW(),'+00:00','-06:00'),'%m-%d')
          THEN STR_TO_DATE(
                 CONCAT(YEAR(CONVERT_TZ(NOW(),'+00:00','-06:00')),'-',DATE_FORMAT(p.fecha_nacimiento,'%m-%d')),
                 '%Y-%m-%d'
               )
        ELSE STR_TO_DATE(
                 CONCAT(YEAR(CONVERT_TZ(NOW(),'+00:00','-06:00'))+1,'-',DATE_FORMAT(p.fecha_nacimiento,'%m-%d')),
                 '%Y-%m-%d'
               )
      END AS proximo_cumple
    FROM perfil p
    LEFT JOIN (
      SELECT id_perfil, MAX(fecha_consulta) AS ultima_fecha_contacto
      FROM consultas
      GROUP BY id_perfil
    ) lc ON lc.id_perfil = p.id_perfil
    WHERE p.fecha_nacimiento IS NOT NULL
    HAVING DATEDIFF(
             proximo_cumple,
             DATE(CONVERT_TZ(NOW(),'+00:00','-06:00'))
           ) BETWEEN 0 AND 30
    ORDER BY proximo_cumple ASC, p.id_perfil ASC
  `);

  const [reminders] = await db.query(`
    SELECT
      c.id_consulta,
      c.id_perfil,
      p.nombre,
      p.telefono_movil,
      c.fecha_consulta,
      c.recordatorio
    FROM consultas c
    INNER JOIN perfil p ON p.id_perfil = c.id_perfil
    WHERE c.recordatorio IS NOT NULL
      AND c.recordatorio >= DATE(CONVERT_TZ(NOW(),'+00:00','-06:00'))
      AND c.recordatorio <= DATE_ADD(DATE(CONVERT_TZ(NOW(),'+00:00','-06:00')), INTERVAL 30 DAY)
    ORDER BY c.recordatorio ASC, c.id_consulta ASC
  `);

  return {
    birthdays,
    reminders,
  };
}
async function removeById(id) {
  const [result] = await db.query(
    'DELETE FROM perfil WHERE id_perfil = ?',
    [id]
  );
  return result;
}



// Calendar
function normalizeAppointmentPayload({ inicio_utc, fin_utc, nombre, telefono, color }) {
  const pad = (value) => String(value).padStart(2, '0');
  const parseNumber = (segment, max, field) => {
    if (segment == null || segment === '') return 0;
    if (!/^\d+$/.test(segment)) throw new Error(`Hora invalida (${field})`);
    const num = Number(segment);
    if (Number.isNaN(num) || num < 0 || num > max) throw new Error(`Hora invalida (${field})`);
    return num;
  };
  const toNaive = (raw, field) => {
    if (raw == null) throw new Error(`${field} es obligatorio`);
    const value = String(raw).trim();
    if (!value) throw new Error(`${field} es obligatorio`);
    let sanitized = value.replace('T', ' ');
    sanitized = sanitized.replace(/Z$/i, '');
    sanitized = sanitized.replace(/([+-]\d{2}:?\d{2})$/i, '');
    sanitized = sanitized.replace(/\.\d+$/, '');
    sanitized = sanitized.trim();
    const parts = sanitized.split(' ');
    if (parts.length === 0) throw new Error(`Fecha invalida (${field})`);
    const datePart = parts[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) throw new Error(`Fecha invalida (${field})`);
    const timePart = parts[1] || '00:00:00';
    const timePieces = timePart.split(':');
    const hours = parseNumber(timePieces[0], 23, field);
    const minutes = parseNumber(timePieces[1] ?? '0', 59, field);
    const seconds = parseNumber(timePieces[2] ?? '0', 59, field);
    return `${datePart} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };
  return {
    inicio_utc: toNaive(inicio_utc, 'inicio_utc'),
    fin_utc: toNaive(fin_utc, 'fin_utc'),
    nombre: nombre || null,
    telefono: telefono || null,
    color: color || null,
  };
}

async function addAppointment({ inicio_utc, fin_utc, nombre, telefono, color }) {
  if (!inicio_utc || !fin_utc || !nombre) {
    throw new Error('inicio_utc, fin_utc y nombre son obligatorios');
  }
  const payload = normalizeAppointmentPayload({ inicio_utc, fin_utc, nombre, telefono, color });
  const [r] = await db.query('INSERT INTO citas SET ?', [payload]);
  return { id_cita: r.insertId };
}

// Lista todas las citas registradas
async function listAppointments() {
  const [rows] = await db.query(
    `SELECT 
       id_cita,
       nombre,
       telefono,
       DATE_FORMAT(inicio_utc, '%Y-%m-%d %H:%i:%s') AS inicio_utc,
       DATE_FORMAT(fin_utc, '%Y-%m-%d %H:%i:%s')     AS fin_utc,
       color
     FROM citas
     ORDER BY inicio_utc DESC, id_cita DESC`
  );
  return rows;
}

async function updateAppointment({ id_cita, inicio_utc, fin_utc, nombre, telefono, color }) {
  const id = Number(id_cita);
  if (!id || Number.isNaN(id)) {
    throw new Error('ID de cita invalido');
  }
  if (!inicio_utc || !fin_utc || !nombre) {
    throw new Error('inicio_utc, fin_utc y nombre son obligatorios');
  }
  const payload = normalizeAppointmentPayload({ inicio_utc, fin_utc, nombre, telefono, color });
  const [result] = await db.query('UPDATE citas SET ? WHERE id_cita = ?', [payload, id]);
  return result;
}

async function deleteAppointment(id) {
  if (!id || Number.isNaN(Number(id))) {
    throw new Error('ID de cita inválido');
  }
  const [result] = await db.query('DELETE FROM citas WHERE id_cita = ?', [id]);
  return result;
}

module.exports = {
  add,
  updatePerfil,
  getSummary,
  postponeContactDate,
  getPending,
  getById,
  removeById,
  addAntecedentesFamiliares,
  replaceAntecedentesFamiliares,
  upsertAntecedentesPersonales,
  upsertGinecoObstetricos,
  addAntecedentesPersonalesPatologicos,
  replaceAntecedentesPersonalesPatologicos,
  upsertDiagnosticoTratamiento,
  upsertExploracionFisica,
  upsertConsultas,
  replaceConsultas,
  addAppointment,
  listAppointments,
  updateAppointment,
  deleteAppointment
};
  
