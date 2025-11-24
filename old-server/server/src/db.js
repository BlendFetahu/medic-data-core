const mysql = require("mysql2/promise");

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const pool = mysql.createPool({
  host: DB_HOST || "127.0.0.1",
  port: Number(DB_PORT) || 3306,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = { pool };
