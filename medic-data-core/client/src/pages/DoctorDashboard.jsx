// client/src/pages/DoctorDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken, getUser } from "../auth";
import useLogout from "../hooks/useLogout";


import DashboardHeader from "../components/DoctorD/DashboardHeader.jsx";
import StatsRow from "../components/DoctorD/StatsRow.jsx";
import PatientsTab from "../components/DoctorD/PatientsTab.jsx";
import AppointmentsTab from "../components/DoctorD/AppointmentsTab.jsx";
import DiagnosesTab from "../components/DoctorD/DiagnosesTab.jsx";
import Tab from "../components/DoctorD/Tab.jsx";

import api from "../api";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const logout = useLogout();

  // ---- Me (doctor) ----
  const [me, setMe] = useState(null);
  const [checking, setChecking] = useState(true);

  // ---- Data from API ----
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);

  // ---- UI ----
  const [tab, setTab] = useState("patients");

  // ---- Helpers ----
  function doctorFullName() {
    const fn = (me?.firstName || me?.name || "").trim();
    const ln = (me?.lastName || "").trim();
    const combined = (fn + " " + ln).trim();
    return combined || me?.email || "Doctor";
  }
  function fullName(p) {
    const fn = (p.firstName || "").trim();
    const ln = (p.lastName || "").trim();
    return (fn + " " + ln).trim() || p.email || "Unknown";
  }
  function fmt(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString();
  }

  // ---- Guard + initial load ----
 // ---- Guard + initial load ----
  useEffect(() => {
    async function run() {
      const userData = getUser(); // Marrim të dhënat nga Local Storage
      const hasAT = !!getAccessToken();
      const role = (userData?.role || "").toUpperCase();

      // Kontrolli i aksesit: Nëse nuk ka token ose nuk është DOCTOR, ktheje te login
      if (!hasAT || role !== "DOCTOR") {
        navigate("/login", { replace: true });
        return;
      }

      // NDRYSHIMI MINIMAL: Përdorim userData direkt
      // Kjo shmang kërkesën api.get("/me") që kthente 404
      setMe(userData);

      try {
        // Thirr rrugët e mjekut te porta 5002 (Hospital Service)
        const [pRes, aRes, dRes] = await Promise.all([
          api.get("/doctors/me/patients"),
          api.get("/doctors/me/appointments"),
          api.get("/doctors/me/diagnoses"),
        ]);

        // patients: Ngarkojmë listën e pacientëve
        setPatients(Array.isArray(pRes.data) ? pRes.data : pRes.data?.items ?? []);

        // appointments: Normalizojmë formatin e kohës për të dhënat e termineve
        const rawAppts = Array.isArray(aRes.data) ? aRes.data : aRes.data?.items ?? [];
        const appts = rawAppts.map(a => {
          const starts =
            a.starts_at ||
            a.start_time ||
            a.scheduled_at ||
            (a.appointment_date && a.appointment_time
              ? `${a.appointment_date} ${a.appointment_time}`
              : a.appointment_date || a.date || null);
          const ends = a.ends_at || a.end_time || null;
          return { ...a, starts_at: starts, ends_at: ends };
        });
        setAppointments(appts);

        // diagnoses: Ngarkojmë listën e diagnozave
        setDiagnoses(Array.isArray(dRes.data) ? dRes.data : dRes.data?.items ?? []);
      } catch (err) {
        console.error("Gabim gjatë ngarkimit të të dhënave të doktorit:", err);
        // Nuk bëjmë navigate("/login") këtu që të mos na bllokojë faqen nëse një rrugë dështon
      } finally {
        // Ndalojmë gjendjen "Loading..."
        setChecking(false);
      }
    }
    run();
  }, [navigate]);

  if (checking) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-8">
      <DashboardHeader
        name={doctorFullName()}
        specialty={me?.specialty}
        email={me?.email}
        onLogout={logout}
      />

      <StatsRow
        patientsCount={patients.length}
        appointmentsCount={appointments.length}
        diagnosesCount={diagnoses.length}
      />

      <div className="flex gap-2">
        <Tab active={tab === "patients"} onClick={() => setTab("patients")}>Patients</Tab>
        <Tab active={tab === "appointments"} onClick={() => setTab("appointments")}>Appointments</Tab>
        <Tab active={tab === "diagnoses"} onClick={() => setTab("diagnoses")}>Diagnoses</Tab>
      </div>

      {tab === "patients" && (
        <PatientsTab
          patients={patients}
          setPatients={setPatients}
          fullName={fullName}
        />
      )}

      {tab === "appointments" && (
        <AppointmentsTab
          appointments={appointments}
          setAppointments={setAppointments}
          fmt={fmt}
        />
      )}

      {tab === "diagnoses" && (
        <DiagnosesTab
          patients={patients}
          diagnoses={diagnoses}
          setDiagnoses={setDiagnoses}
          fullName={fullName}
          fmt={fmt}
        />
      )}
    </div>
  );
}
