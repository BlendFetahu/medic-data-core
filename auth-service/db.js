import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql', // 'mysql' sepse ky është emri i container-it
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'password', // Duhet të jetë fiks si te docker-compose
  database: process.env.DB_NAME || 'medic_auth',
});