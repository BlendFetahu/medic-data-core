import express from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db.js"; 
import { signAccess, signRefresh, verifyRefresh, hashToken, compareHash } from "../utils/tokens.js";
import { insertRefreshToken, findActiveByUser, revokeById } from "../repositories/refreshTokens.js";

const router = express.Router();

/** SIGNUP – Regjistron vetëm pacientë si default */
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const [exists] = await pool.query("SELECT id FROM users WHERE email=?", [email]);
    if (exists.length) {
      return res.status(409).json({ message: "Email already used" });
    }

    const hash = await bcrypt.hash(password, 10);

    // Ruajmë rolin gjithmonë me shkronja të mëdha
    await pool.query(
      "INSERT INTO users (email, password, role) VALUES (?, ?, 'PATIENT')",
      [email, hash]
    );

    return res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error("SIGNUP error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/** LOGIN – Gjeneron Token me Rolin e saktë nga DB */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const [rows] = await pool.query(
      "SELECT id, email, password, role FROM users WHERE email=? LIMIT 1",
      [email]
    );
    if (!rows.length) return res.status(401).json({ message: "Invalid credentials" });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    // Sigurohemi që roli është string dhe me shkronja të mëdha
    const userRole = (user.role || "PATIENT").toUpperCase();

    // Krijojmë Access Token me të gjitha të dhënat (role është kyçi)
    const accessToken = signAccess({ 
      sub: user.id, 
      role: userRole, 
      email: user.email 
    });

    const { token: refreshToken } = signRefresh({ sub: user.id });
    const decoded = verifyRefresh(refreshToken); 
    const rtHash = hashToken(refreshToken);

    await insertRefreshToken({
      userId: user.id,
      tokenHash: rtHash,
      expiresAt: new Date(decoded.exp * 1000),
    });

    return res.json({
      user: { id: user.id, email: user.email, role: userRole, name: null },
      accessToken,
      token: accessToken, // Për kompatibilitet me front-endin    
      refreshToken
    });
  } catch (err) {
    console.error("LOGIN error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/** REFRESH – Rregulluar për të mos humbur Rolin */
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) return res.status(400).json({ message: "Missing refreshToken" });

    let decoded;
    try {
      decoded = verifyRefresh(refreshToken); 
    } catch {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const [userRows] = await pool.query(
        "SELECT id, email, role FROM users WHERE id=? LIMIT 1",
        [decoded.sub]
    );
    const user = userRows[0];

    if (!user) return res.status(401).json({ message: "User not found" });

    const actives = await findActiveByUser(user.id);
    if (!actives.length) return res.status(401).json({ message: "No active refresh token" });

    const match = actives.find(rt => compareHash(refreshToken, rt.token_hash));
    if (!match) return res.status(401).json({ message: "Refresh token not found" });

    await revokeById(match.id);

    const userRole = (user.role || "PATIENT").toUpperCase();
    const accessToken = signAccess({ 
        sub: user.id, 
        role: userRole, 
        email: user.email 
    });

    const { token: newRefreshToken } = signRefresh({ sub: user.id });
    const newDecoded = verifyRefresh(newRefreshToken);
    const newHash = hashToken(newRefreshToken);

    await insertRefreshToken({
      userId: user.id,
      tokenHash: newHash,
      expiresAt: new Date(newDecoded.exp * 1000),
    });

    return res.json({ accessToken, refreshToken: newRefreshToken, role: userRole });
  } catch (err) {
    console.error("REFRESH error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/** LOGOUT */
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) return res.status(400).json({ message: "Missing refreshToken" });

    let decoded = null;
    try { decoded = verifyRefresh(refreshToken); } catch { /* ignore */ }

    if (decoded?.sub) {
      const actives = await findActiveByUser(decoded.sub);
      const match = actives.find(rt => compareHash(refreshToken, rt.token_hash));
      if (match) {
        await revokeById(match.id);
      }
    }

    return res.json({ message: "Logged out" });
  } catch (err) {
    console.error("LOGOUT error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/ping", (_req, res) => res.send("auth-pong"));

/** ME – Endpoint që shërben rolin e saktë nga DB */
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token" });

    const token = authHeader.split(" ")[1];
    // Këtu duhet të dekodosh tokenin (access token)
    let decoded;
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        decoded = JSON.parse(atob(base64));
    } catch (e) {
        return res.status(401).json({ message: "Invalid token format" });
    }

    const [rows] = await pool.query(
      "SELECT id, email, role FROM users WHERE id=? LIMIT 1",
      [decoded.sub]
    );

    if (!rows.length) return res.status(404).json({ message: "User not found" });

    const user = rows[0];
    return res.json({
      id: user.id,
      email: user.email,
      role: (user.role || "PATIENT").toUpperCase()
    });
  } catch (err) {
    console.error("ME error:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
});

export default router;