import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// NDRYSHIMI KËTU: Merr DB_PASS në vend të DB_PASSWORD
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

export const pool = mysql.createPool({
  host: DB_HOST || "mysql",
  port: Number(DB_PORT) || 3306,
  user: DB_USER,
  password: DB_PASSWORD, // <--- Kjo duhet të jetë DB_PASS
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});