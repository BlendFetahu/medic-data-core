// server/src/middlewares/auth.js
const { verifyAccess } = require("../utils/tokens");

function requireAuth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const payload = verifyAccess(token); // <-- përdor ACCESS_SECRET
    // normalizo rolin në uppercase
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: (payload.role || "").toUpperCase(),
    };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function requireRole(expected) {
  return (req, res, next) => {
    const actual = (req.user?.role || "").toUpperCase();
    if (actual !== expected.toUpperCase()) {
      return res.status(403).json({ message: "Forbidden", need: expected, got: actual });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
