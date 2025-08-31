// controllers/polizas.js
const db = require('../models/db'); // pool mysql2
const {
  addPolizaTx,
  addManyParticipantsTx,
  getPolizasPreview,
  getPolizasSummary,
  getPolizaWithParticipants,
  patchPolizaFieldsTx,
  syncPolizaParticipantesTx,
  deletePolizaCascadeTx,
  getPolizasByCliente
} = require('../models/policy');

const ROLES = new Set(['asegurado', 'beneficiario']);
const ALLOWED_POLIZA = [
  'aseguradora','numero_poliza','categoria_poliza','subcategoria_poliza',
  'fecha_inicio_poliza','fecha_termino_poliza',
  'titular_id_cliente','forma_pago','periodicidad_pago','notas','notas_participantes','prima','detalle_poliza'
];

const isDate = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

function cleanPoliza(obj = {}) {
  const o = {};
  for (const k of ALLOWED_POLIZA) if (k in obj) o[k] = obj[k] === '' ? null : obj[k];

  if (!o.numero_poliza || o.titular_id_cliente == null)
    throw new Error('numero_poliza y titular_id_cliente son requeridos');

  if (o.fecha_inicio_poliza && !isDate(o.fecha_inicio_poliza))
    throw new Error('Fecha inválida en fecha_inicio_poliza (YYYY-MM-DD)');

  if (o.fecha_termino_poliza && !isDate(o.fecha_termino_poliza))
    throw new Error('Fecha inválida en fecha_termino_poliza (YYYY-MM-DD)');

  if (o.fecha_inicio_poliza && o.fecha_termino_poliza && o.fecha_inicio_poliza > o.fecha_termino_poliza)
    throw new Error('fecha_inicio_poliza no puede ser mayor que fecha_termino_poliza');

  // 👇 Limpieza mínima de notas
  if (o.notas != null) {
    o.notas = String(o.notas).trim();
    if (o.notas.length > 2500) throw new Error('notas supera 2500 caracteres');
  }
  if (o.notas_participantes != null) {
    o.notas_participantes = String(o.notas_participantes).trim();
    if (o.notas_participantes.length > 2500) {
      throw new Error('notas_participantes supera 2500 caracteres');
    }
  }
  if ('prima' in o) {
  if (o.prima === '' || o.prima == null) {
    o.prima = null;
  } else {
    const n = Number(o.prima);
    if (!Number.isFinite(n) || n < 0) {
      throw new Error('prima inválida: debe ser número >= 0');
    }
    o.prima = Number(n.toFixed(2));
  }
}
  return o;
}

function cleanParticipants(arr = []) {
  if (!Array.isArray(arr)) return [];
  return arr.map(x => {
    const cliente_id = Number(x.cliente_id);
    const rol = String(x.rol || '').toLowerCase();
    const porcentaje = x.porcentaje === '' || x.porcentaje == null ? null : Number(x.porcentaje);

    if (!Number.isInteger(cliente_id)) throw new Error('cliente_id inválido en participantes');
    if (!ROLES.has(rol)) throw new Error('rol inválido en participantes');
    if (porcentaje != null && (Number.isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100))
      throw new Error('porcentaje fuera de rango en participantes');

    return { cliente_id, rol, porcentaje };
  });
}

// POST /polizas/bundle
// Body: [ { ...poliza }, [ {cliente_id, rol, porcentaje?}, ... ] ]
async function addBundle(req, res) {
  const body = req.body;
  const polizaIn = Array.isArray(body) ? body[0] : body.poliza;
  const partsIn  = Array.isArray(body) ? body[1] : body.participantes;

  try {
    const poliza = cleanPoliza(polizaIn || {});
    const participantes = cleanParticipants(partsIn || []);

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const { id_poliza } = await addPolizaTx(conn, poliza);

      if (participantes.length) {
        await addManyParticipantsTx(conn, id_poliza, participantes);
      }

      await conn.commit();
      return res.status(201).json({
        ok: true,
        id_poliza,
        participantes_agregados: participantes.length
      });
    } catch (e) {
      await conn.rollback();
      if (e.code === 'ER_DUP_ENTRY')
        return res.status(409).json({ ok: false, error: 'numero_poliza ya existe' });
      return res.status(500).json({ ok: false, error: e.message });
    } finally {
      conn.release();
    }
  } catch (e) {
    return res.status(400).json({ ok: false, error: e.message });
  }
}
async function listPreview(req, res) {
  const limit  = Math.min(Math.max(parseInt(req.query.limit, 10)  || 200, 1), 500);
  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

  const conn = await db.getConnection();
  try {
    const rows = await getPolizasPreview(conn, { limit, offset });
    return res.status(200).json({
      ok: true,
      items: rows, // [{ id_poliza, numero_poliza, aseguradora, fecha_inicio_poliza, fecha_termino_poliza }]
      paging: { limit, offset, count: rows.length }
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  } finally {
    conn.release();
  }
}

// Resumen paginado similar a perfiles
async function listSummary(req, res) {
  const page  = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 50);
  const offset = (page - 1) * limit;

  const conn = await db.getConnection();
  try {
    const { rows, total } = await getPolizasSummary(conn, { limit, offset });
    return res.status(200).json({ polizas: rows, total });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
}
async function getOne(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ ok: false, error: 'id inválido' });
  }

  const conn = await db.getConnection();
  try {
    const data = await getPolizaWithParticipants(conn, id); // { poliza, participantes } | null
    if (!data) {
      return res.status(404).json({ ok: false, error: 'Póliza no encontrada' });
    }
    return res.status(200).json({
      ok: true,
      poliza: data.poliza,
      participantes: data.participantes
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  } finally {
    conn.release();
  }
}

async function editBundle(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ ok: false, error: 'id inválido' });
  }

  const body = req.body || {};
  const polizaIn = Array.isArray(body) ? body[0] : body.poliza;
  const partsIn  = Array.isArray(body) ? body[1] : body.participantes;

  try {
    const poliza = cleanPoliza(polizaIn || {});
    const participantes = cleanParticipants(partsIn || []);

    // Si quieres forzar que los beneficiarios sumen 100%, descomenta:
    // const sum = participantes.filter(p => p.rol === 'beneficiario')
    //   .reduce((a,p) => a + (Number(p.porcentaje) || 0), 0);
    // if (Number(sum.toFixed(2)) !== 100) {
    //   return res.status(422).json({ ok:false, error:`Beneficiarios deben sumar 100% (actual: ${sum}%)` });
    // }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const r = await patchPolizaFieldsTx(conn, id, poliza);
      if (!r.affectedRows) {
        throw Object.assign(new Error('Póliza no encontrada'), { http: 404 });
      }

      const sync = await syncPolizaParticipantesTx(conn, id, participantes);

      await conn.commit();
      return res.status(200).json({
        ok: true,
        id_poliza: id,
        participantes_sincronizados: sync.inserted
      });
    } catch (e) {
      await conn.rollback();
      if (e.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ ok: false, error: 'numero_poliza ya existe' });
      }
      if (e.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(422).json({ ok: false, error: 'cliente_id no existe' });
      }
      const status = e.http || 500;
      return res.status(status).json({ ok: false, error: e.message });
    } finally {
      conn.release();
    }
  } catch (e) {
    return res.status(400).json({ ok: false, error: e.message });
  }
}
async function deleteOne(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ ok: false, error: 'id inválido' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Verifica existencia para responder 404 limpio
    const [exists] = await conn.query(
      'SELECT 1 FROM polizas WHERE id_poliza = ? LIMIT 1',
      [id]
    );
    if (!exists.length) {
      await conn.rollback();
      return res.status(404).json({ ok: false, error: 'Póliza no encontrada' });
    }

    // Borra participantes y luego la póliza
    const r = await deletePolizaCascadeTx(conn, id);

    await conn.commit();
    return res.status(200).json({
      ok: true,
      id_poliza: id,
      deleted: r.affectedRows > 0
    });
  } catch (e) {
    await conn.rollback();

    // Si hay otras tablas referenciando la póliza (además de poliza_participante)
    if (e.code === 'ER_ROW_IS_REFERENCED_2' || e.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(409).json({
        ok: false,
        error: 'No se puede eliminar: existen registros relacionados'
      });
    }

    return res.status(500).json({ ok: false, error: e.message });
  } finally {
    conn.release();
  }
}
async function listByClient(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ ok: false, error: 'id inválido' });
  }

  const conn = await db.getConnection();
  try {
    const rows = await getPolizasByCliente(conn, id);
    return res.status(200).json({ ok: true, items: rows });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  } finally {
    conn.release();
  }
}

module.exports = { addBundle, listPreview, listSummary, getOne, editBundle, deleteOne, listByClient };
