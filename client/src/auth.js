// client/src/auth.js
const KEY_USER = "auth:user";
const KEY_AT   = "auth:accessToken";
const KEY_RT   = "auth:refreshToken";

export function setAuth(accessToken, refreshToken, user) {
  if (accessToken) localStorage.setItem(KEY_AT, accessToken);
  if (refreshToken) localStorage.setItem(KEY_RT, refreshToken);
  if (user) localStorage.setItem(KEY_USER, JSON.stringify(user));
}

export function getAccessToken()  { return localStorage.getItem(KEY_AT) || null; }
export function getRefreshToken() { return localStorage.getItem(KEY_RT) || null; }
export function getUser() {
  const s = localStorage.getItem(KEY_USER);
  try { return s ? JSON.parse(s) : null; } catch { return null; }
}

export function clearAuth() {
  localStorage.removeItem(KEY_AT);
  localStorage.removeItem(KEY_RT);
  localStorage.removeItem(KEY_USER);
}


export function getRole() {
  const u = getUser();
  return (u?.role || "").toUpperCase() || null;
}


export function getToken() {
  return getAccessToken();
}

// ---- Compatibility helpers for old imports ----

// Kthe bool nëse access token ka skaduar.
// Nëse nuk ka AT fare -> e konsiderojmë të skaduar.
export function isExpired() {
  const t = getAccessToken();
  if (!t) return true;
  try {
    const payload = JSON.parse(
      decodeURIComponent(
        atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
          .split("")
          .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      )
    );
    if (!payload?.exp) return false;
    return Date.now() / 1000 > payload.exp;
  } catch {
    // nëse s'decodohet dot, mos e blloko — le të vazhdojë klienti
    return false;
  }
}
