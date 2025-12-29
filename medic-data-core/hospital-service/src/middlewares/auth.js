// hospital-service/src/middlewares/auth.js (ose auth-service)
import jwt from "jsonwebtoken";

/**
 * Middleware për të verifikuar nëse përdoruesi ka një Token të vlefshëm.
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "I paautorizuar: Mungon Token-i" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Sigurohemi që Secret ekziston në .env
    const secret = process.env.JWT_SECRET || "supersecret";
    
    const decoded = jwt.verify(token, "supersecret");
    
    // Vendosim të dhënat e përdoruesit (id, email, role) te objekti req
    req.user = decoded; 
    
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(403).json({ message: "Token i pavlefshëm ose i skaduar" });
  }
};

/**
 * Middleware për të kontrolluar rolin (ADMIN, DOCTOR, PATIENT).
 * Përdoret pas requireAuth.
 */
export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "I paautorizuar" });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: `Akses i mohuar: Kërkohet roli ${role}` });
    }

    next();
  };
};