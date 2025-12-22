import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const ACCESS_SECRET = process.env.JWT_SECRET || "access_secret_123";
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret_456";

// Gjenerimi i Access Token (Afatshkurtër - p.sh. 15 minuta)
export const signAccess = (payload) => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
};

// Gjenerimi i Refresh Token (Afatgjatë - p.sh. 7 ditë)
export const signRefresh = (payload) => {
  const token = jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
  return { token };
};

// Verifikimi i Access Token (Përdoret te Middleware)
export const verifyAccess = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};

// Verifikimi i Refresh Token
export const verifyRefresh = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};

// Funksionet për Hashim (për ruajtje në DB/Redis)
export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const compareHash = (token, storedHash) => {
  const currentHash = hashToken(token);
  return currentHash === storedHash;
};