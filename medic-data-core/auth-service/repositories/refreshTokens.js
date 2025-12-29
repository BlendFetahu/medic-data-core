import { pool } from "../db.js"; // Sigurohu që emri i file-it është i saktë dhe shto .js

// Ruaj një refresh token (hash + expiry)
export async function insertRefreshToken({ userId, tokenHash, expiresAt }) {
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES (?, ?, ?)`,
    [userId, tokenHash, expiresAt]
  );
}

// Kthe të gjitha refresh tokens AKTIVE të një përdoruesi
export async function findActiveByUser(userId) {
  const [rows] = await pool.query(
    `SELECT * FROM refresh_tokens
     WHERE user_id=? AND revoked=0 AND expires_at > NOW()`,
    [userId]
  );
  return rows;
}

// Revoko një RT specifik
export async function revokeById(id) {
  await pool.query(`UPDATE refresh_tokens SET revoked=1 WHERE id=?`, [id]);
}

// Opsional: revoko të gjitha RT të një useri
export async function revokeAllForUser(userId) {
  await pool.query(`UPDATE refresh_tokens SET revoked=1 WHERE user_id=?`, [userId]);
}