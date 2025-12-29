import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAccessToken, parseJwt } from "../auth"; // Përdorim parseJwt direkt për siguri

const norm = (r) => String(r || "").replace(/^ROLE_/i, "").toUpperCase();

export default function ProtectedRoute({ allowed = [] }) {
  const location = useLocation();
  const token = getAccessToken();

  // 1. Nëse nuk ka token fare, dërgoje te login
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 2. Merr rolin direkt duke dekoduar tokenin (metoda më e sigurt)
  let role = "";
  try {
    const payload = parseJwt(token);
    role = norm(payload?.role);
    //console.log("ProtectedRoute - Roli i gjetur në token:", role);
  } catch (err) {
    console.error("Gabim në dekodimin e tokenit:", err);
    return <Navigate to="/login" replace />;
  }

  // 3. Kontrollo nëse roli i përdoruesit është në listën e lejuar
  const allowedNorm = allowed.map(norm);
  
  if (allowedNorm.length > 0 && !allowedNorm.includes(role)) {
    console.warn(`Akses i ndaluar! Roli ${role} nuk është në listën:`, allowedNorm);
    return <Navigate to="/403" replace />;
  }

  // 4. Çdo gjë OK, lejo kalimin
  return <Outlet />;
}