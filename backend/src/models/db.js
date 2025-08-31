
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

module.exports = connection;
