import { useMemo, useState } from "react";
import Card from "./Card";

export default function AppointmentsTab({ appointments, setAppointments, fmt }) {

  const [status, setStatus] = useState("all");
  const [openApptMenu, setOpenApptMenu] = useState(null);

  function statusBtnClasses(s = "") {
    const k = String(s).toLowerCase();
    if (k === "done") return "bg-emerald-600 hover:bg-emerald-700 text-white";
    if (k === "cancelled") return "bg-rose-600 hover:bg-rose-700 text-white";
    return "bg-amber-500 hover:bg-amber-600 text-white";
  }
  function optionClasses(s = "") {
    const k = String(s).toLowerCase();
    if (k === "done") return "bg-emerald-100 text-emerald-700 hover:bg-emerald-200";
    if (k === "cancelled") return "bg-rose-100 text-rose-700 hover:bg-rose-200";
    return "bg-amber-100 text-amber-700 hover:bg-amber-200";
  }

  // 🔹 helper për emrin e pacientit (lexon alias-et nga backend)
  function patientName(a) {
    if (a.patientName) return a.patientName;
    const fn = (a.patientFirstName || a.first_name || "").trim();
    const ln = (a.patientLastName  || a.last_name  || "").trim();
    const name = (fn + " " + ln).trim();
    return name || a.patientEmail || a.patient_email || "Unknown patient";
  }

  const filteredAppointments = useMemo(() => {
    return (appointments || [])
      .slice()
      .sort((a, b) => new Date(b.starts_at || b.scheduled_at) - new Date(a.starts_at || a.scheduled_at))
      .filter(a => (status === "all" ? true : String(a.status).toLowerCase() === status));
  }, [appointments, status]);

  function setApptStatusLocal(id, nextStatus) {
    setAppointments(prev => prev.map(a => (a.id === id ? { ...a, status: nextStatus } : a)));
    setOpenApptMenu(null);
  }

  return (
    <Card
      title="My Appointments"
      right={
        <select
          className="border rounded px-3 py-2 text-sm w-full sm:w-auto"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="all">All</option>
          <option value="scheduled">Scheduled</option>
          <option value="done">Done</option>
          <option value="cancelled">Cancelled</option>
        </select>
      }
    >
      {filteredAppointments.length === 0 && (
        <div className="text-sm text-gray-500">No appointments for this filter.</div>
      )}

      <ul className="space-y-2">
        {filteredAppointments.map(a => (
          <li key={a.id} className="rounded border p-3">
            <div className="flex items-center justify-between">
              <div>
                {/* 🔹 këtu përdorim helper-in */}
                <div className="font-medium">{patientName(a)}</div>
                <div className="text-base font-medium text-gray-700">
                  {fmt(a.starts_at || a.scheduled_at)}
                </div>
              </div>
              <div className="text-right">
                <button
                  onClick={() => setOpenApptMenu(openApptMenu === a.id ? null : a.id)}
                  className={`text-xs px-3 py-1 rounded ${statusBtnClasses(a.status)}`}
                  title="Change status"
                >
                  {a.status}
                </button>
              </div>
            </div>

            {openApptMenu === a.id && (
              <div className="mt-2 flex gap-2 justify-end">
                <button
                  className={`text-xs px-3 py-1 rounded ${optionClasses("scheduled")}`}
                  onClick={() => setApptStatusLocal(a.id, "scheduled")}
                >
                  Scheduled
                </button>
                <button
                  className={`text-xs px-3 py-1 rounded ${optionClasses("done")}`}
                  onClick={() => setApptStatusLocal(a.id, "done")}
                >
                  Done
                </button>
                <button
                  className={`text-xs px-3 py-1 rounded ${optionClasses("cancelled")}`}
                  onClick={() => setApptStatusLocal(a.id, "cancelled")}
                >
                  Cancelled
                </button>
              </div>
            )}

            {a.reason && <div className="text-sm mt-2">{a.reason}</div>}
          </li>
        ))}
      </ul>
    </Card>
  );
}
