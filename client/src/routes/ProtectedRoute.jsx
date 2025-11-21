// client/src/routes/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAccessToken, getUser } from "../auth";

const norm = (r) => String(r || "").replace(/^ROLE_/i, "").toUpperCase();

export default function ProtectedRoute({ allowed = [] }) {
  const location = useLocation();

  const token = getAccessToken();              // ✅ vetëm kontroll ekzistence
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const role = norm(getUser()?.role);         // ✅ merre rolin nga user-i në storage
  const allowedNorm = allowed.map(norm);
  if (allowedNorm.length > 0 && !allowedNorm.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
