const { signAccess, signRefresh, verifyRefresh, hashToken, compareHash } = require("../utils/tokens");
const { insertRefreshToken, findActiveByUser, revokeById } = require("../repositories/refreshTokens");

const express = require("express");
const bcrypt = require("bcryptjs");
const { pool } = require("../db");

const router = express.Router();



/** SIGNUP – lejo vetëm pacientë */
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // kontrollo nëse ekziston
    const [exists] = await pool.query("SELECT id FROM users WHERE email=?", [email]);
    if (exists.length) {
      return res.status(409).json({ message: "Email already used" });
    }

    // krijo hash
    const hash = await bcrypt.hash(password, 10);

    // fut pacientin
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

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // gjej userin
    const [rows] = await pool.query(
      "SELECT id, email, password, role FROM users WHERE email=? LIMIT 1",
      [email]
    );
    if (!rows.length) return res.status(401).json({ message: "Invalid credentials" });

    const user = rows[0];

    // verifiko fjalëkalimin
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    // 1) gjenero ACCESS token (afat i shkurtër)
    const accessToken = signAccess({ sub: user.id, role: user.role, email: user.email });

    // 2) gjenero REFRESH token (afat i gjatë) dhe ruaj HASH-in në DB
    const { token: refreshToken } = signRefresh({ sub: user.id });
    const decoded = verifyRefresh(refreshToken); // për të marrë exp
    const rtHash = hashToken(refreshToken);

    await insertRefreshToken({
      userId: user.id,
      tokenHash: rtHash,
      expiresAt: new Date(decoded.exp * 1000),
    });

    // 3) përgjigja — për kompatibilitet, kthejmë edhe 'token' = accessToken
    return res.json({
      user: { id: user.id, email: user.email, role: (user.role || "").toUpperCase(), name: null },
      accessToken,
      token: accessToken,    
      refreshToken
    });
  } catch (err) {
    console.error("LOGIN error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /auth/refresh
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) return res.status(400).json({ message: "Missing refreshToken" });

    // verifiko nënshkrimin dhe skadimin
    let decoded;
    try {
      decoded = verifyRefresh(refreshToken); 
    } catch {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // gjej të gjitha RT aktive të këtij useri
    const actives = await findActiveByUser(decoded.sub);
    if (!actives.length) return res.status(401).json({ message: "No active refresh token" });

    // krahaso tokenin e ardhur me hash-in në DB
    const match = actives.find(rt => compareHash(refreshToken, rt.token_hash));
    if (!match) return res.status(401).json({ message: "Refresh token not found" });

    // 1) revoko të vjetrin
    await revokeById(match.id);

    // 2) gjenero access të ri
    const accessToken = signAccess({ sub: decoded.sub });

    // 3) gjenero refresh të ri dhe ruaj hash-in
    const { token: newRefreshToken } = signRefresh({ sub: decoded.sub });
    const newDecoded = verifyRefresh(newRefreshToken);
    const newHash = hashToken(newRefreshToken);

    await insertRefreshToken({
      userId: decoded.sub,
      tokenHash: newHash,
      expiresAt: new Date(newDecoded.exp * 1000),
    });

    return res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error("REFRESH error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /auth/logout
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) return res.status(400).json({ message: "Missing refreshToken" });

    // verifiko nënshkrimin; nëse s'vlen, thjesht s'ka ç'të revokojmë
    let decoded = null;
    try { decoded = verifyRefresh(refreshToken); } catch { /* ignore */ }

    if (decoded?.sub) {
      // gjej RT-të aktive për userin
      const actives = await findActiveByUser(decoded.sub);
      // gjej pikërisht këtë RT (krahasim me bcrypt)
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

module.exports = router;
