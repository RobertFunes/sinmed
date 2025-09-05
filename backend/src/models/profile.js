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

// Inserta/actualiza (1:1) padecimiento_actual_interrogatorio por id_perfil
// data: objeto parcial con columnas válidas (sin id_perfil)
async function upsertPadecimientoActualInterrogatorio(id_perfil, data = {}) {
  if (!id_perfil) throw new Error('id_perfil requerido');
  const payload = { ...data };

  // Filtra null/undefined para no sobrescribir con null innecesariamente
  const cols = Object.keys(payload).filter((k) => payload[k] != null);
  if (cols.length === 0) return { affectedRows: 0 };

  const fields = ['id_perfil', ...cols];
  const placeholders = fields.map(() => '?').join(', ');
  const values = [id_perfil, ...cols.map((k) => payload[k])];

  const updates = cols.map((k) => `${k}=VALUES(${k})`).join(', ');
  const sql = `INSERT INTO padecimiento_actual_interrogatorio (${fields.join(', ')}) VALUES (${placeholders})
               ON DUPLICATE KEY UPDATE ${updates}`;
  const [result] = await db.query(sql, values);
  return result;
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
async function getById(id) {
  const [rows] = await db.query(
    'SELECT * FROM clientes WHERE id_cliente = ?',
    [id]
  );
  const row = rows?.[0];
  if (!row) return null;

  const toYMD = (v) => {
    if (v == null) return v;
    if (typeof v === 'string') return v.slice(0, 10);
    if (v instanceof Date) {
      const y = v.getUTCFullYear();
      const m = String(v.getUTCMonth() + 1).padStart(2, '0');
      const d = String(v.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return v;
  };

  // ✂️ Fechas
  row.fecha_nacimiento      = toYMD(row.fecha_nacimiento);
  row.ultima_fecha_contacto = toYMD(row.ultima_fecha_contacto);

  // 🗑️ Campos de póliza descartados
  delete row.aseguradora;
  delete row.numero_poliza;
  delete row.categoria_poliza;
  delete row.subcategoria_poliza;
  delete row.detalle_poliza;
  delete row.fecha_inicio_poliza;
  delete row.fecha_termino_poliza;
  delete row.tipo_poliza;
  delete row.seguros_contratados;
  delete row.asegurados;

  return row;
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
  addAntecedentesPersonalesPatologicos,
  upsertPadecimientoActualInterrogatorio,
  upsertExploracionFisica,
  upsertDiagnosticoTratamiento 
};
  
