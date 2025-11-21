// client/src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { setAuth } from "../auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setAuth(data.accessToken, data.refreshToken, data.user);
      window.dispatchEvent(new Event("auth-changed"));

      switch ((data.user?.role || "").toUpperCase()) {
        case "ADMIN":  navigate("/admin");  break;
        case "DOCTOR": navigate("/doctor"); break;
        default:       navigate("/patient");
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      
      <div className="h-28 bg-gradient-to-r from-sky-600 to-teal-500"></div>

      {/* Forma qendrore */}
      <main className="flex-grow flex items-center justify-center -mt-12 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
          <h1 className="mb-6 text-center text-3xl font-semibold text-slate-900">
            Sign in
          </h1>

          {err && (
            <p className="mb-4 text-sm text-red-600 text-center">{err}</p>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-sky-600 px-4 py-2.5 text-white font-medium hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
            >
              Sign in
            </button>

            {/* Link i vogël për regjistrim */}
            <p className="text-center text-sm text-slate-500">
              Don’t have an account?{" "}
              <a href="/signup" className="text-sky-600 hover:underline">
                Register here
              </a>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
