import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; // ✅ Sigurohu që importi është pa kllapa { } sepse është default export
import { parseJwt, setAuth } from "../auth";

export default function Login() {
  const navigate = useNavigate();
  
  // Vlerat që përputhen me ato që futëm në Database
  const [email, setEmail] = useState("admin@test.com"); 
  const [password, setPassword] = useState("admin123");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    
    try {
      console.log("🚀 Duke dërguar kërkesën për:", email);
      
      // Thirrja te Gateway (rruga /auth/login)
      const { data } = await api.post("/auth/login", { email, password });
      
      console.log("✅ Përgjigja e marrë:", data);

      // 1. Ruajmë Token-at dhe User-in
      setAuth(data.accessToken, data.refreshToken, data.user);

      // 2. Njoftojmë sistemin për ndryshim autentikimi
      window.dispatchEvent(new Event("auth-changed"));

      // 3. Përcaktojmë Rolin (nga Tokeni ose nga objekti user)
      const payload = parseJwt(data.accessToken);
      const role = (payload?.role || data.user?.role || "").toUpperCase();

      console.log("👤 Roli i identifikuar:", role);

      // 4. Navigimi i saktë sipas rrugëve në App.jsx
      if (role === "ADMIN") {
        window.location.href = "/admin/dashboard";
      } else if (role === "DOCTOR") {
        window.location.href = "/doctor/dashboard";
      } else {
        window.location.href = "/patient/dashboard";
      }

    } catch (e2) {
      console.error("❌ Login Error:", e2);
      const msg = e2.response?.data?.message || "Email ose fjalëkalim i gabuar";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 360, margin: "40px auto", border: "1px solid #ccc", borderRadius: 8, fontFamily: "sans-serif", backgroundColor: "#fff" }}>
      <h2 style={{ textAlign: "center", color: "#333" }}>Hospital Login</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 15 }}>
          <label style={{ fontWeight: "bold" }}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ display: "block", width: "100%", padding: "10px", marginTop: 5, boxSizing: "border-box", border: "1px solid #ddd", borderRadius: 4 }}
          />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label style={{ fontWeight: "bold" }}>Fjalëkalimi:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ display: "block", width: "100%", padding: "10px", marginTop: 5, boxSizing: "border-box", border: "1px solid #ddd", borderRadius: 4 }}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading} 
          style={{ 
            padding: "12px", 
            width: "100%", 
            backgroundColor: loading ? "#ccc" : "#28a745", 
            color: "white", 
            border: "none", 
            borderRadius: 4,
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px"
          }}
        >
          {loading ? "Duke u kyçur..." : "Kyçu"}
        </button>
      </form>
      {err && (
        <div style={{ backgroundColor: "#f8d7da", color: "#721c24", padding: "10px", marginTop: "15px", borderRadius: "4px", textAlign: "center", fontSize: "14px" }}>
          {err}
        </div>
      )}
    </div>
  );
}