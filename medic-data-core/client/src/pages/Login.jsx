import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api";
import { parseJwt, setAuth } from "../auth";


export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("admin123");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const data = await loginUser({ email, password });

      // ruaj token-at
      setAuth(data.accessToken, data.refreshToken, data.user);
      window.dispatchEvent(new Event("auth-changed"));

      // roli nga JWT
      const payload = parseJwt(data.accessToken);
      const role = (payload?.role || "").toUpperCase();

      if (role === "ADMIN") navigate("/admin/dashboard");
      else if (role === "DOCTOR") navigate("/doctor/dashboard");
      else navigate("/patient/dashboard");

    } catch (err) {
      setErr(err.response?.data?.message || "Email ose password i gabuar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "40px auto" }}>
      <h2>Hospital Login</h2>

      <form onSubmit={onSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Duke u kyçur..." : "Kyçu"}
        </button>
      </form>

      {err && <p style={{ color: "red" }}>{err}</p>}
    </div>
  );
}
