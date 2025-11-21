import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { parseJwt } from "../auth";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("Admin123!");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);

      const payload = parseJwt(data.token);
      const role = (payload?.role || "").toUpperCase();

      if (role === "ADMIN")      nav("/admin/dashboard", { replace: true });
      else if (role === "DOCTOR") nav("/doctor/dashboard", { replace: true });
      else                        nav("/patient/dashboard", { replace: true });
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 360, margin: "40px auto" }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
        />
        <button type="submit" disabled={loading} style={{ padding: "8px 12px" }}>
          {loading ? "..." : "Login"}
        </button>
      </form>
      {err && <p style={{ color: "red" }}>{err}</p>}
    </div>
  );
}
