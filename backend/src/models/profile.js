const db = require('./db'); // 👈 Aquí importas la conexión

async function add(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Payload inválido para add(perfil)');
  }
  const [result] = await db.query('INSERT INTO perfil SET ?', [data]);
  return result?.insertId;
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

async function getAll() {
  const [rows] = await db.query('SELECT * FROM clientes');
  return rows;
}

// Resumen paginado de perfiles
async function getSummary(limit = 50, offset = 0) {
  const [rows] = await db.query(
    `SELECT
      id_cliente,              -- 🔑 para rutas /profile/:id
      nombre,
      telefono_movil,
      ultima_fecha_contacto,
      fecha_nacimiento
    FROM clientes
    LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  const [[{ total }]] = await db.query(
    'SELECT COUNT(*) AS total FROM clientes'
  );

  return { rows, total };
}
// Versión sobre perfil con actualizado máximo y edad (solo DATE)
async function getSummary(limit = 50, offset = 0) {
  const [rows] = await db.query(
    `SELECT
       p.id_perfil,
       p.nombre,
       p.telefono_movil,
       CASE
         WHEN p.fecha_nacimiento IS NULL THEN NULL
         ELSE TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE())
       END AS edad,
       DATE_FORMAT(p.creado, '%Y-%m-%d') AS creado,
       DATE_FORMAT(GREATEST(
         COALESCE(p.actualizado,       DATE '1970-01-01'),
         COALESCE(af.max_actualizado,  DATE '1970-01-01'),
         COALESCE(ap.actualizado,      DATE '1970-01-01'),
         COALESCE(app.max_actualizado, DATE '1970-01-01'),
         COALESCE(ef.max_actualizado,  DATE '1970-01-01'),
         COALESCE(dt.max_actualizado,  DATE '1970-01-01')
       ), '%Y-%m-%d') AS actualizado
     FROM perfil p
     LEFT JOIN (SELECT id_perfil, MAX(actualizado) AS max_actualizado
                FROM antecedentes_familiares GROUP BY id_perfil) af
       ON af.id_perfil = p.id_perfil
     LEFT JOIN (SELECT id_perfil, MAX(actualizado) AS max_actualizado
                FROM antecedentes_personales_patologicos GROUP BY id_perfil) app
       ON app.id_perfil = p.id_perfil
     LEFT JOIN (SELECT id_perfil, actualizado FROM antecedentes_personales) ap
       ON ap.id_perfil = p.id_perfil
     LEFT JOIN (SELECT id_perfil, MAX(actualizado) AS max_actualizado
                FROM exploracion_fisica GROUP BY id_perfil) ef
       ON ef.id_perfil = p.id_perfil
     LEFT JOIN (SELECT id_perfil, MAX(actualizado) AS max_actualizado
                FROM diagnostico_tratamiento GROUP BY id_perfil) dt
       ON dt.id_perfil = p.id_perfil
     ORDER BY actualizado DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM perfil');
  return { rows, total };
}


async function getById(id_perfil) {
  const id = Number(id_perfil);
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, error: { code: 'BAD_REQUEST', message: 'id_perfil inválido' } };
  }
  const [pRows] = await db.query(
    'SELECT * FROM perfil WHERE id_perfil = ? LIMIT 1',
    [id]
  );
  const perfil = pRows?.[0];
  if (!perfil) {
    return { ok: false, error: { code: 'NOT_FOUND', message: 'Perfil no encontrado' } };
  }

  const toYMD = (v) => {
    if (v == null) return v;
    if (v instanceof Date) {
      const y = v.getUTCFullYear();
      const m = String(v.getUTCMonth() + 1).padStart(2, '0');
      const d = String(v.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    // Si ya viene como string fecha ISO, normaliza a YYYY-MM-DD
    if (typeof v === 'string' && /\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
    return v;
  };

  // Campos fecha por tabla (solo estos se formatean a YYYY-MM-DD)
  const DATE_KEYS = {
    perfil: new Set(['fecha_nacimiento', 'actualizado', 'creado']),
    default: new Set(['creado', 'actualizado'])
  };

  // Nueva construcción de respuesta según reglas
  const compactRow = (obj, scope = 'default') => {
    const out = {};
    const dateKeys = DATE_KEYS[scope] || DATE_KEYS.default;
    for (const [k, v] of Object.entries(obj || {})) {
      const val = dateKeys.has(k) ? toYMD(v) : v;
      if (val != null && val !== '') out[k] = val;
    }
    return out;
  };

  const result = { ok: true, ...compactRow(perfil, 'perfil') };

  // 1:1 antecedentes_personales
  const [apRows] = await db.query('SELECT * FROM antecedentes_personales WHERE id_perfil = ? LIMIT 1', [id]);
  if (apRows?.length) {
    const ap = compactRow(apRows[0]);
    if (Object.keys(ap).length > 0) result.antecedentes_personales = ap;
  }

  // 1:N colecciones
  const tables1N = [
    'antecedentes_familiares',
    'antecedentes_personales_patologicos',
    'diagnostico_tratamiento',
    'exploracion_fisica',
  ];
  const includedDateStrings = [];
  if (result.actualizado) includedDateStrings.push(result.actualizado);

  for (const t of tables1N) {
    const [rows] = await db.query(`SELECT * FROM ${t} WHERE id_perfil = ? ORDER BY creado DESC`, [id]);
    if (Array.isArray(rows) && rows.length > 0) {
      const items = rows.map((r) => compactRow(r, t)).filter((o) => Object.keys(o).length > 0);
      if (items.length > 0) {
        result[t] = items;
        for (const it of items) {
          if (it.actualizado) includedDateStrings.push(it.actualizado);
        }
      }
    }
  }

  // actualizado_max
  const toDate = (s) => {
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };
  let max = null;
  for (const s of includedDateStrings) {
    const d = toDate(s);
    if (d && (!max || d > max)) max = d;
  }
  if (max) result.actualizado_max = toYMD(max);

  // ✂️ Fechas
  // row.fecha_nacimiento      = toYMD(row.fecha_nacimiento);
  // row.ultima_fecha_contacto = toYMD(row.ultima_fecha_contacto);

  // 🗑️ Campos de póliza descartados
  // delete row.aseguradora;
  // delete row.numero_poliza;
  // delete row.categoria_poliza;
  // delete row.subcategoria_poliza;
  // delete row.detalle_poliza;
  // delete row.fecha_inicio_poliza;
  // delete row.fecha_termino_poliza;
  // delete row.tipo_poliza;
  // delete row.seguros_contratados;
  // delete row.asegurados;

  return result;
}
async function updateUltimaFechaContacto(id, fecha) {
  const [result] = await db.query(
    'UPDATE clientes SET ultima_fecha_contacto = ? WHERE id_cliente = ?',
    [fecha, id]
  );
  return result;
}

// Suma "days" a la ultima_fecha_contacto de un cliente
async function postponeContactDate(id, days = 45) {
  const [result] = await db.query(
    'UPDATE clientes SET ultima_fecha_contacto = DATE_ADD(ultima_fecha_contacto, INTERVAL ? DAY) WHERE id_cliente = ?',
    [days, id]
  );
  return result;
}

async function getPending() {
  /* 🇲🇽 NOW_MX = hora/fecha de México (UTC-6) */
  const [rows] = await db.query(`
    SELECT
      id_cliente AS id,
      nombre,
      ultima_fecha_contacto,

      /* 🎂 Próximo cumple calculado con hora CDMX */
      CASE
        WHEN DATE_FORMAT(fecha_nacimiento,'%m-%d') >= DATE_FORMAT(CONVERT_TZ(NOW(),'+00:00','-06:00'),'%m-%d')
          THEN STR_TO_DATE(
                 CONCAT(YEAR(CONVERT_TZ(NOW(),'+00:00','-06:00')),'-',DATE_FORMAT(fecha_nacimiento,'%m-%d')),
                 '%Y-%m-%d'
               )
        ELSE STR_TO_DATE(
                 CONCAT(YEAR(CONVERT_TZ(NOW(),'+00:00','-06:00'))+1,'-',DATE_FORMAT(fecha_nacimiento,'%m-%d')),
                 '%Y-%m-%d'
               )
      END AS proximo_cumple

    FROM clientes

    WHERE (
  CASE
    WHEN DATE_FORMAT(fecha_nacimiento,'%m-%d') >= DATE_FORMAT(DATE(CONVERT_TZ(NOW(),'+00:00','-06:00')),'%m-%d')
      THEN DATEDIFF(
             STR_TO_DATE(
               CONCAT(YEAR(DATE(CONVERT_TZ(NOW(),'+00:00','-06:00'))),'-',DATE_FORMAT(fecha_nacimiento,'%m-%d')),
               '%Y-%m-%d'
             ),
             DATE(CONVERT_TZ(NOW(),'+00:00','-06:00'))
           )
    ELSE DATEDIFF(
             STR_TO_DATE(
               CONCAT(YEAR(DATE(CONVERT_TZ(NOW(),'+00:00','-06:00')))+1,'-',DATE_FORMAT(fecha_nacimiento,'%m-%d')),
               '%Y-%m-%d'
             ),
             DATE(CONVERT_TZ(NOW(),'+00:00','-06:00'))
           )
  END
) <= 30

  `);
  return rows;
}
async function removeById(id) {
  const [result] = await db.query(
    'DELETE FROM clientes WHERE id_cliente = ?',
    [id]
  );
  return result;
}
async function modifyClient(id, data) {
  const record = { ...data };
  delete record.aseguradora;
  delete record.numero_poliza;
  delete record.categoria_poliza;
  delete record.subcategoria_poliza;
  delete record.detalle_poliza;
  delete record.fecha_inicio_poliza;
  delete record.fecha_termino_poliza;
  delete record.tipo_poliza;
  delete record.seguros_contratados;
  delete record.asegurados;

  // 🎂 y 📅 existentes
  if (record.fecha_nacimiento)
    record.fecha_nacimiento = record.fecha_nacimiento.slice(0, 10);
  if (record.ultima_fecha_contacto)
    record.ultima_fecha_contacto = record.ultima_fecha_contacto.slice(0, 10);

  const [result] = await db.query(
    'UPDATE clientes SET ? WHERE id_cliente = ?',
    [record, id]
  );
  return result;
}

async function getNameById(id) {
  const [rows] = await db.query(
    'SELECT id_cliente, nombre FROM clientes WHERE id_cliente = ?',
    [id]
  );
  return rows?.[0] || null;
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
  getAll,
  getSummary,
  updateUltimaFechaContacto,
  postponeContactDate,
  getPending,
  getById,
  removeById,
  modifyClient,
  getNameById,
  addAntecedentesFamiliares,
  upsertAntecedentesPersonales,
  upsertGinecoObstetricos,
  addAntecedentesPersonalesPatologicos,
  upsertDiagnosticoTratamiento,
  upsertExploracionFisica,
  upsertConsultas,
  addAppointment,
  listAppointments,
  updateAppointment,
  deleteAppointment
};
  
