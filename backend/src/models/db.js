
const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT, // 👈 ¡No olvides el puerto!
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

async function withTransaction(work) {
  const transaction = await connection.getConnection();
  try {
    await transaction.beginTransaction();
    const result = await work(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error('Error al revertir transacción:', rollbackError);
    }
    throw error;
  } finally {
    transaction.release();
  }
}

connection.withTransaction = withTransaction;

module.exports = connection;
