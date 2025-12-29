import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Krijojmë një "Pool" lidhjesh për performancë më të lartë
export const pool = mysql.createPool({
  host: process.env.DB_HOST || "mysql",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "medic_db",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testojmë lidhjen në momentin që niset shërbimi
pool.getConnection()
  .then(conn => {
    console.log("✅ Connected to MySQL Database");
    conn.release();
  })
  .catch(err => {
    console.error("❌ Database connection failed:", err.message);
  });