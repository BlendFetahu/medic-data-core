import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// Kemi vendosur të njëjtin sekret si te API Gateway për të zgjidhur 403
const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET || "supersecretaccess";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "supersecretrefresh";

// Duhet të jetë diçka e tillë:
export const signAccess = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || "supersecret", { expiresIn: "1h" });
};

export function signRefresh(payload) {
  const jti = crypto.randomUUID();
  const token = jwt.sign({ ...payload, jti }, REFRESH_SECRET, { expiresIn: "7d" });
  return { token, jti };
}

export function verifyAccess(token)  { return jwt.verify(token, ACCESS_SECRET); }
export function verifyRefresh(token) { return jwt.verify(token, REFRESH_SECRET); }

export function hashToken(str)        { return bcrypt.hashSync(str, 10); }
export function compareHash(str, hash){ return bcrypt.compareSync(str, hash); }