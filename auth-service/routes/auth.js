import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { signAccess, signRefresh, hashToken, verifyRefresh } from '../utils/tokens.js';
import { insertRefreshToken, findActiveByUser, revokeById } from '../repositories/refreshTokens.js';

const router = express.Router();

// 1. REGISTER
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await pool.query("INSERT INTO users (email, password, role) VALUES (?, ?, 'PATIENT')", [email, hashedPassword]);
        res.status(201).json({ message: "User registered" });
    } catch (err) {
        res.status(500).json({ message: "Register error" });
    }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        const user = rows[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const accessToken = signAccess({ sub: user.id, role: user.role, email: user.email });
        const { token: refreshToken } = signRefresh({ sub: user.id });
        
        const decoded = jwt.decode(refreshToken);
        await insertRefreshToken({
            userId: user.id,
            tokenHash: hashToken(refreshToken),
            expiresAt: new Date(decoded.exp * 1000)
        });

        res.json({ message: "Login successful", accessToken, refreshToken });
    } catch (err) {
        res.status(500).json({ message: "Server error during login" });
    }
});

// 3. REFRESH (Versioni i thjeshtuar për test)
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(401).json({ message: "No token" });

        const decoded = jwt.decode(refreshToken);
        if (!decoded) return res.status(403).json({ message: "Invalid token" });

        const [u] = await pool.query("SELECT * FROM users WHERE id = ?", [decoded.sub]);
        const user = u[0];

        const accessToken = signAccess({ sub: user.id, role: user.role, email: user.email });
        res.json({ accessToken });
    } catch (err) {
        res.status(403).json({ message: "Refresh error" });
    }
});

// 4. LOGOUT (Faza 2 - Pika 6)
router.post('/logout', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.json({ message: "Logged out" });

        const decoded = jwt.decode(refreshToken);
        if (decoded && decoded.sub) {
            const actives = await findActiveByUser(decoded.sub);
            const currentHash = hashToken(refreshToken);
            const match = actives.find(rt => currentHash === rt.token_hash);
            if (match) await revokeById(match.id);
        }
        return res.json({ message: "Logged out successfully" });
    } catch (err) {
        return res.json({ message: "Logged out" });
    }
});

// 5. PING
router.get('/ping', (req, res) => res.send("Auth service is alive"));

export default router;