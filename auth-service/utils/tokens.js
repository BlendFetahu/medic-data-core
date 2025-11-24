const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

function signAccess(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: process.env.ACCESS_EXPIRES_IN || "15m" });
}

function signRefresh(payload) {
  const jti = crypto.randomUUID();
  const token = jwt.sign({ ...payload, jti }, REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRES_IN || "7d" });
  return { token, jti };
}

function verifyAccess(token)  { return jwt.verify(token, ACCESS_SECRET); }
function verifyRefresh(token) { return jwt.verify(token, REFRESH_SECRET); }

function hashToken(str)        { return bcrypt.hashSync(str, 10); }
function compareHash(str, hash){ return bcrypt.compareSync(str, hash); }

module.exports = {
  signAccess,
  signRefresh,
  verifyAccess,
  verifyRefresh,
  hashToken,
  compareHash
};
