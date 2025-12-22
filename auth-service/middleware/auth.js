import { verifyAccess } from "../utils/tokens.js"; // Shto .js ne fund

export function requireAuth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const payload = verifyAccess(token);
    
    // Normalizojmë të dhënat e përdoruesit për përdorim në rutat tjera
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: (payload.role || "").toUpperCase(),
    };
    
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireRole(expected) {
  return (req, res, next) => {
    const actual = (req.user?.role || "").toUpperCase();
    if (actual !== expected.toUpperCase()) {
      return res.status(403).json({ 
        message: "Forbidden: Access denied", 
        need: expected, 
        got: actual 
      });
    }
    next();
  };
}