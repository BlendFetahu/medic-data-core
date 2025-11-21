// client/src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getDoctors, createDoctor, getPatients, deletePatient, deleteDoctor } from "../api";
import { getAccessToken, getUser } from "../auth";
import useLogout from "../hooks/useLogout";
import ConfirmModal from "../components/common/ConfirmModal.jsx";
import { SPECIALTY_OPTIONS } from "../constants/specialties";


export default function AdminDashboard() {
  const logout = useLogout();
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [checking, setChecking] = useState(true);

 
  useEffect(() => {
    async function run() {
      const hasAT = !!getAccessToken();
      const role = (getUser()?.role || "").toUpperCase();
      if (!hasAT || role !== "ADMIN") {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const res = await api.get("/me");
        setMe(res.data.user);
      } catch {
        navigate("/login", { replace: true });
      } finally {
        setChecking(false);
      }
    }
    run();
  }, [navigate]);

  // ===== Tabs & stats =====
  const [tab, setTab] = useState("doctors"); // 'doctors' | 'patients'
  const [search, setSearch] = useState("");

  // ===== Data =====
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  // ===== Form "Add Doctor" =====
  const [dName, setDName] = useState("");
  const [dEmail, setDEmail] = useState("");
  const [dPassword, setDPassword] = useState("");
  const [dSpecialty, setDSpecialty] = useState("");
  const [msg, setMsg] = useState(null);

  // ===== Modal për fshirje pacienti =====
  const [confirm, setConfirm] = useState({ open: false, id: null });

  // Helpers për të normalizuar përgjigjet (mund të kthehen {items: []} ose direkt array)
  const toItems = (res) => (Array.isArray(res) ? res : (res?.items ?? []));

  async function loadDoctors() {
    const res = await getDoctors({ search, page: 1, limit: 50 });
    setDoctors(toItems(res));
  }

  async function loadPatients() {
    const res = await getPatients({ search, page: 1, limit: 50 });
    setPatients(toItems(res));
  }


  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        if (tab === "doctors") await loadDoctors();
        else await loadPatients();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (!checking) run();
    return () => {
      cancelled = true;
    };
  }, [tab, search, checking]);

  async function handleAddDoctor(e) {
    e.preventDefault();
    setMsg(null);
    try {
      await createDoctor({
        name: dName,
        email: dEmail,
        password: dPassword,
        specialty: dSpecialty,
      });
      setMsg("Doctor created ✅");
      setDName(""); setDEmail(""); setDPassword(""); setDSpecialty("");
      await loadDoctors();
    } catch (e2) {
      setMsg(e2?.response?.data?.message || "Failed to create doctor");
    }
  }

  async function handleDeletePatient(id) {
    try {
      await deletePatient(id);
      setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch (e2) {
      alert(e2?.response?.data?.message || "Failed to delete");
    } finally {
      setConfirm({ open: false, id: null });
    }
  }

  // === Modal & handler për fshirje doktori ===
  const [confirmDoc, setConfirmDoc] = useState({ open: false, id: null });

  async function handleDeleteDoctor(id) {
    try {
      await deleteDoctor(id);
      setDoctors(prev => prev.filter(d => d.id !== id));
    } catch (e2) {
      alert(e2?.response?.data?.message || "Failed to delete doctor");
    } finally {
      setConfirmDoc({ open: false, id: null });
    }
  }



  if (checking) return <div className="p-6">Loading…</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Hero */}
          <div className="rounded-2xl bg-gradient-to-r from-teal-500 to-blue-500 text-white p-6 mb-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
                <p className="opacity-90">
                  {me ? `${me.email} (admin)` : "Loading..."}
                </p>
              </div>
              <button
                  onClick={logout}
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg"
                >
                  Log out
                </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl border p-4 bg-green-50">
              <p className="text-sm text-gray-600">Doctors</p>
              <p className="text-2xl font-semibold">{doctors.length}</p>
            </div>
            <div className="rounded-xl border p-4 bg-blue-50">
              <p className="text-sm text-gray-600">Patients</p>
              <p className="text-2xl font-semibold">{patients.length || "—"}</p>
            </div>
          </div>

          {/* Tabs + Search */}
          <div className="flex gap-2 mb-4">
            <button
              className={`px-4 py-2 rounded-lg border ${tab === "doctors" ? "bg-green-600 text-white" : "bg-white"}`}
              onClick={() => setTab("doctors")}
            >
              Doctors
            </button>
            <button
              className={`px-4 py-2 rounded-lg border ${tab === "patients" ? "bg-blue-600 text-white" : "bg-white"}`}
              onClick={() => setTab("patients")}
            >
              Patients
            </button>

            <div className="ml-auto">
              <input
                className="border rounded-lg px-3 py-2 w-64"
                placeholder="Search by name/email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Content */}
          <div className="rounded-2xl border p-4">
            {loading ? (
              <p className="text-gray-500">Loading…</p>
            ) : tab === "doctors" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Form Add Doctor */}
                <div>
                  <h3 className="font-semibold mb-3">Add Doctor</h3>
                  <form onSubmit={handleAddDoctor} className="space-y-3 max-w-md">
                    <input
                      className="border rounded-lg px-3 py-2 w-full"
                      placeholder="Name"
                      value={dName}
                      onChange={(e) => setDName(e.target.value)}
                    />
                    <input
                      className="border rounded-lg px-3 py-2 w-full"
                      placeholder="Email"
                      value={dEmail}
                      onChange={(e) => setDEmail(e.target.value)}
                      required
                    />
                    <input
                      className="border rounded-lg px-3 py-2 w-full"
                      placeholder="Password"
                      type="password"
                      value={dPassword}
                      onChange={(e) => setDPassword(e.target.value)}
                      required
                    />
                    <select
                      className="border rounded-lg px-3 py-2 w-full"
                      value={dSpecialty}
                      onChange={(e) => setDSpecialty(e.target.value)}
                      required
                    >
                      <option value="">-- Zgjedh Specialty --</option>
                      {SPECIALTY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>

                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded-lg"
                    >
                      Create
                    </button>
                    {msg && <p className="text-sm mt-2">{msg}</p>}
                  </form>
                </div>




                {/* List Doctors */}
                <div>
                  <h3 className="font-semibold mb-3">Doctors List</h3>
                  <ul className="space-y-2">
                    {doctors.length === 0 && (
                      <li className="text-gray-500">No doctors found.</li>
                    )}
                    {doctors.map((d) => (
                      <li
                        key={d.id}
                        className="border rounded-xl px-4 py-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{d.name || "(no name)"}</p>
                          <p className="text-sm text-gray-600">{d.email}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">{d.specialty || ""}</span>
                          <button
                            onClick={() => setConfirmDoc({ open: true, id: d.id })}
                            className="bg-red-600 text-white px-3 py-1.5 rounded-lg"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              // Patients Tab
              <div>
                <h3 className="font-semibold mb-3">Patients List</h3>
                <ul className="space-y-2">
                  {patients.length === 0 && (
                    <li className="text-gray-500">No patients found.</li>
                  )}
                  {patients.map((p) => (
                    <li
                      key={p.id}
                      className="border rounded-xl px-4 py-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{p.name || "(no name)"}</p>
                        <p className="text-sm text-gray-600">{p.email}</p>
                      </div>
                      <button
                        onClick={() => setConfirm({ open: true, id: p.id })}
                        className="bg-red-600 text-white px-3 py-1.5 rounded-lg"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Confirm Delete Modal — Patient */}
      <ConfirmModal
        open={confirm.open}
        title="Delete patient"
        message="Do you really want to delete this patient?"
        onCancel={() => setConfirm({ open: false, id: null })}
        onConfirm={() => handleDeletePatient(confirm.id)}
      />

      {/* Confirm Delete Modal — Doctor */}
      <ConfirmModal
        open={confirmDoc.open}
        title="Delete doctor"
        message="Do you really want to delete this doctor?"
        onCancel={() => setConfirmDoc({ open: false, id: null })}
        onConfirm={() => handleDeleteDoctor(confirmDoc.id)}
      />
    </div>
  );
}
