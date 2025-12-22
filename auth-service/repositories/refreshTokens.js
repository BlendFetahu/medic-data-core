import { pool } from '../db.js';

export const insertRefreshToken = async ({ userId, tokenHash, expiresAt }) => {
    const query = 'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)';
    return pool.query(query, [userId, tokenHash, expiresAt]);
};

export const findActiveByUser = async (userId) => {
    const [rows] = await pool.query(
        'SELECT * FROM refresh_tokens WHERE user_id = ? AND revoked = 0',
        [userId]
    );
    return rows;
};

export const revokeById = async (id) => {
    return pool.query('UPDATE refresh_tokens SET revoked = 1 WHERE id = ?', [id]);
};