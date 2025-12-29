// client/src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setErr("No token. Hyni me login."); setLoading(false); return; }

    fetch("http://localhost:4000/me", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.message || "Failed");
        return d;
      })
      .then((d) => setData(d.user)) // {id,email,role}
      .catch((e) => setErr(e.message || "Error"))
      .finally(() => setLoading(false));
  }, []);

  const ping = async () => {
    try {
      const token = localStorage.getItem("token");
      const path = {
        ADMIN:  "/admin/ping",
        DOCTOR: "/doctor/ping",
        PATIENT:"/patient/ping",
      }[data?.role] || "/patient/ping";

      const res = await fetch("http://localhost:4000" + path, {
        headers: { Authorization: "Bearer " + token }
      });
      const out = await res.json().catch(() => ({}));
      alert(res.ok ? "Ping OK ✅" : "Ping failed ❌: " + (out.message || ""));
    } catch (e) {
      alert("Ping failed ❌");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // UI
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-xl shadow p-8">
          <div className="h-6 w-40 bg-slate-200 rounded animate-pulse" />
          <div className="mt-6 space-y-3">
            <div className="h-4 w-64 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-52 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  if (err) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-800">Profile</h2>
          <p className="mt-3 text-sm text-red-600">{err}</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 w-full rounded-md bg-sky-600 px-4 py-2 text-white font-medium hover:bg-sky-700"
          >
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-8">
        <h2 className="text-2xl font-bold text-slate-800">Profile</h2>

        <div className="mt-6 space-y-2 text-slate-700">
          <p><span className="font-medium">Email:</span> {data?.email}</p>
          <p><span className="font-medium">Role:</span> {data?.role}</p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={ping}
            className="flex-1 rounded-md bg-emerald-600 px-4 py-2 text-white font-medium hover:bg-emerald-700"
          >
            Test {data?.role} ping
          </button>
          <button
            onClick={logout}
            className="flex-1 rounded-md bg-slate-100 px-4 py-2 text-slate-800 font-medium ring-1 ring-slate-200 hover:bg-slate-200"
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}
