import React from "react";
import { Navigate } from "react-router-dom";
import { getAccessToken, getUser } from "../auth";

export default function AdminRoute({ children }) {
  const at = getAccessToken();
  if (!at) return <Navigate to="/login" replace />;

  const role = (getUser()?.role || "").toUpperCase();
  if (role !== "ADMIN") return <Navigate to="/login" replace />;

  return children;
}
