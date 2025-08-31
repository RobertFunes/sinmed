// models/polizas.js  🧽 SIN require('./db')
async function addPolizaTx(conn, { numero_poliza, titular_id_cliente, ...rest }) {
  if (!numero_poliza || titular_id_cliente == null)
    throw new Error('numero_poliza y titular_id_cliente son requeridos');
  const [r] = await conn.query('INSERT INTO polizas SET ?', [{ numero_poliza, titular_id_cliente, ...rest }]);
  return { id_poliza: r.insertId };
}

async function addManyParticipantsTx(conn, poliza_id, items) {
  if (!items?.length) return { affectedRows: 0 };
  const rows = items.map(p => [poliza_id, p.cliente_id, p.rol, p.porcentaje ?? null]);
  const [r] = await conn.query(
    'INSERT INTO poliza_participante (poliza_id, cliente_id, rol, porcentaje) VALUES ?',
    [rows]
  );
  return r;
}
async function getPolizasPreview(conn, { limit = 200, offset = 0 } = {}) {
  const [rows] = await conn.query(
    `
    SELECT
      id_poliza,
      numero_poliza,
      aseguradora,
      titular_id_cliente,
      DATE_FORMAT(fecha_inicio_poliza, '%Y-%m-%d') AS fecha_inicio_poliza,
      DATE_FORMAT(fecha_termino_poliza, '%Y-%m-%d') AS fecha_termino_poliza
    FROM polizas
    ORDER BY updated_at DESC, id_poliza DESC
    LIMIT ? OFFSET ?
    `,
    [limit, offset]
  );
  return rows;
}

// Resumen paginado de pólizas
async function getPolizasSummary(conn, { limit = 50, offset = 0 } = {}) {
  const [rows] = await conn.query(
    `
    SELECT
      id_poliza,
      numero_poliza,
      aseguradora,
      titular_id_cliente,
      DATE_FORMAT(fecha_inicio_poliza, '%Y-%m-%d') AS fecha_inicio_poliza,
      DATE_FORMAT(fecha_termino_poliza, '%Y-%m-%d') AS fecha_termino_poliza
    FROM polizas
    ORDER BY updated_at DESC, id_poliza DESC
    LIMIT ? OFFSET ?
    `,
    [limit, offset]
  );

  const [[{ total }]] = await conn.query(
    'SELECT COUNT(*) AS total FROM polizas'
  );

  return { rows, total };
}
async function getPolizaWithParticipants(conn, id_poliza) {
  const pid = Number(id_poliza);
  if (!Number.isInteger(pid) || pid <= 0) throw new Error('id_poliza inválido');

  const [rows] = await conn.query(
    `
    SELECT
      id_poliza,
      aseguradora,
      numero_poliza,
      categoria_poliza,
      subcategoria_poliza,
      detalle_poliza,
      notas,
      notas_participantes,
      DATE_FORMAT(fecha_inicio_poliza, '%Y-%m-%d') AS fecha_inicio_poliza,
      DATE_FORMAT(fecha_termino_poliza, '%Y-%m-%d') AS fecha_termino_poliza,
      titular_id_cliente,
      forma_pago,
      periodicidad_pago,
      prima,
      created_at,
      updated_at
    FROM polizas
    WHERE id_poliza = ?
    LIMIT 1
    `,
    [pid]
  );

  if (!rows.length) return null;

  const [participantes] = await conn.query(
    `
    SELECT
      pp.cliente_id,
      c.nombre,
      pp.rol,
      pp.porcentaje
    FROM poliza_participante pp
    JOIN clientes c ON pp.cliente_id = c.id_cliente
    WHERE pp.poliza_id = ?
    ORDER BY pp.rol, pp.cliente_id
    `,
    [pid]
  );

  return { poliza: rows[0], participantes };
}
async function syncPolizaParticipantesTx(conn, id_poliza, participantes = []) {
  const pid = Number(id_poliza);
  if (!Number.isInteger(pid) || pid <= 0) throw new Error('id_poliza inválido');

  if (!Array.isArray(participantes)) throw new Error('participantes debe ser un arreglo');

  const ROLES = new Set(['asegurado', 'beneficiario']);
  const seen = new Set();
  const rows = [];

  for (const raw of participantes) {
    const cliente_id = Number(raw?.cliente_id);
    const rol = String(raw?.rol || '').toLowerCase();

    if (!Number.isInteger(cliente_id) || cliente_id <= 0) {
      throw new Error('cliente_id inválido en participantes');
    }
    if (!ROLES.has(rol)) throw new Error('rol inválido (asegurado|beneficiario)');

    let porcentaje = null;
    if (rol === 'beneficiario') {
      const p = Number(String(raw?.porcentaje ?? '').toString().replace(',', '.'));
      if (!Number.isFinite(p) || p < 0 || p > 100) {
        throw new Error('porcentaje inválido (0..100)');
      }
      porcentaje = Number(p.toFixed(2));
    }

    const key = `${cliente_id}|${rol}`;
    if (seen.has(key)) continue; // quita duplicados
    seen.add(key);

    rows.push([pid, cliente_id, rol, porcentaje]);
  }

  // Borra y repuebla
  await conn.query('DELETE FROM poliza_participante WHERE poliza_id = ?', [pid]);

  if (!rows.length) return { inserted: 0 };

  // Inserción masiva
  await conn.query(
    `INSERT INTO poliza_participante (poliza_id, cliente_id, rol, porcentaje)
     VALUES ?`,
    [rows]
  );

  return { inserted: rows.length };
}
async function patchPolizaFieldsTx(conn, id_poliza, fields = {}) {
  const pid = Number(id_poliza);
  if (!Number.isInteger(pid) || pid <= 0) throw new Error('id_poliza inválido');

  if (!fields || typeof fields !== 'object') return { affectedRows: 0 };

  // Normaliza strings vacíos a null y recorta espacios
  const cleaned = {};
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'string') cleaned[k] = v.trim();
    else cleaned[k] = v;
    if (cleaned[k] === '') cleaned[k] = null;
  }

  // Prima a número con 2 decimales si viene
  if (cleaned.prima != null) {
    const n = Number(String(cleaned.prima).toString().replace(',', '.'));
    if (!Number.isFinite(n) || n < 0) throw new Error('prima inválida');
    cleaned.prima = Number(n.toFixed(2));
  }

  // Solo columnas editables
  const ALLOWED = new Set([
    'aseguradora',
    'numero_poliza',
    'categoria_poliza',
    'subcategoria_poliza',
    'detalle_poliza',
    'fecha_inicio_poliza',
    'fecha_termino_poliza',
    'titular_id_cliente',
    'forma_pago',
    'periodicidad_pago',
    'notas',
    'notas_participantes',
    'prima',
  ]);

  const patch = {};
  for (const k in cleaned) {
    if (ALLOWED.has(k)) patch[k] = cleaned[k];
  }

  if (Object.keys(patch).length === 0) return { affectedRows: 0 };

  const [r] = await conn.query(
    'UPDATE polizas SET ?, updated_at = NOW() WHERE id_poliza = ?',
    [patch, pid]
  );

  return r; // { affectedRows, changedRows, ... }
}
async function deletePolizaCascadeTx(conn, id_poliza) {
  const pid = Number(id_poliza);
  if (!Number.isInteger(pid) || pid <= 0) throw new Error('id_poliza inválido');

  // Elimina primero participantes para evitar restricciones FK
  await conn.query('DELETE FROM poliza_participante WHERE poliza_id = ?', [pid]);

  // Elimina la póliza
  const [r] = await conn.query('DELETE FROM polizas WHERE id_poliza = ? LIMIT 1', [pid]);
  return r; // { affectedRows, ... }
}
async function getPolizasByCliente(conn, cliente_id) {
  const cid = Number(cliente_id);
  if (!Number.isInteger(cid) || cid <= 0) throw new Error('cliente_id inválido');

  const [rows] = await conn.query(
    `
    SELECT
      p.id_poliza,
      p.aseguradora,
      p.numero_poliza,
      p.categoria_poliza,
      p.subcategoria_poliza,
      p.detalle_poliza,
      p.notas,
      p.notas_participantes,
      DATE_FORMAT(p.fecha_inicio_poliza, '%Y-%m-%d') AS fecha_inicio_poliza,
      DATE_FORMAT(p.fecha_termino_poliza, '%Y-%m-%d') AS fecha_termino_poliza,
      CONCAT_WS(',',
        IF(p.titular_id_cliente = ?, 'titular', NULL),
        GROUP_CONCAT(DISTINCT pp.rol)
      ) AS roles
    FROM polizas p
    LEFT JOIN poliza_participante pp
      ON p.id_poliza = pp.poliza_id AND pp.cliente_id = ?
    WHERE p.titular_id_cliente = ? OR pp.cliente_id IS NOT NULL
    GROUP BY p.id_poliza
    ORDER BY p.fecha_inicio_poliza DESC, p.id_poliza DESC
    `,
    [cid, cid, cid]
  );

  return rows;
}
module.exports = { 
  addPolizaTx, 
  addManyParticipantsTx, 
  getPolizasPreview,
  getPolizasSummary,
  getPolizaWithParticipants,
  syncPolizaParticipantesTx,
  patchPolizaFieldsTx,
  deletePolizaCascadeTx,
  getPolizasByCliente
};