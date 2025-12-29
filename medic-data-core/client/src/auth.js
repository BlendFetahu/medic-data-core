// client/src/auth.js
const KEY_USER = "auth:user";
const KEY_AT   = "auth:accessToken";
const KEY_RT   = "auth:refreshToken";

// --- FUNKSIONI I RI I SHTUAR (Për të zgjidhur SyntaxError) ---
export function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Gabim gjatë dekodimit të tokenit", e);
    return null;
  }
}

export function setAuth(accessToken, refreshToken, user) {
  if (accessToken) localStorage.setItem(KEY_AT, accessToken);
  // Ruajmë tokenin edhe me çelësin e thjeshtë "token" për pajtueshmëri me Login.jsx
  if (accessToken) localStorage.setItem("token", accessToken); 
  if (refreshToken) localStorage.setItem(KEY_RT, refreshToken);
  if (user) localStorage.setItem(KEY_USER, JSON.stringify(user));
}

export function getAccessToken()  { return localStorage.getItem(KEY_AT) || localStorage.getItem("token") || null; }
export function getRefreshToken() { return localStorage.getItem(KEY_RT) || null; }

export function getUser() {
  const s = localStorage.getItem(KEY_USER);
  if (s) {
    try { return JSON.parse(s); } catch { return null; }
  }
  // Nëse nuk kemi user në storage, provojmë ta nxjerrim nga tokeni
  const token = getAccessToken();
  return parseJwt(token);
}

export function clearAuth() {
  localStorage.removeItem(KEY_AT);
  localStorage.removeItem(KEY_RT);
  localStorage.removeItem(KEY_USER);
  localStorage.removeItem("token");
}

export function getRole() {
  const u = getUser();
  return (u?.role || "").toUpperCase() || null;
}

export function getToken() {
  return getAccessToken();
}

// ---- Compatibility helpers for old imports ----

export function isExpired() {
  const t = getAccessToken();
  if (!t) return true;
  try {
    const payload = parseJwt(t);
    if (!payload?.exp) return false;
    return Date.now() / 1000 > payload.exp;
  } catch {
    return false;
  }
}