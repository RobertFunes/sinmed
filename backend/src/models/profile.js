const db = require('./db'); // 👈 Aquí importas la conexión

async function add(data) {
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
  const [result] = await db.query(
    'INSERT INTO clientes SET ?',
    [record]
  );
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
  getNameById 
};
  
