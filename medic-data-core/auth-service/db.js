import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password', 
  database: process.env.DB_NAME || 'medic_auth',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});