// client/src/pages/AppointmentNew.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../api";

function initials(name) {
  if (!name) return "DR";
  const parts = String(name).trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "DR";
}

// 16 slots, 30-min each, from 08:00–16:00 (08:00, 08:30, …, 15:30)
const ALL_SLOTS = (() => {
  const out = [];
  for (let h = 8; h < 16; h++) {
    out.push(`${String(h).padStart(2, "0")}:00`);
    out.push(`${String(h).padStart(2, "0")}:30`);
  }
  return out;
})();

function isWeekend(dateStr) {
  if (!dateStr) return false;
  const d = new Date(`${dateStr}T00:00:00`);
  const wd = d.getDay(); // 0=Sun, 6=Sat
  return wd === 0 || wd === 6;
}

// "YYYY-MM-DD" + "HH:mm" -> "YYYY-MM-DD HH:mm:00"
function toMySQLFromParts(dateStr, hhmm) {
  if (!dateStr || !hhmm) return null;
  const hasSec = hhmm.length > 5 ? hhmm : `${hhmm}:00`;
  return `${dateStr} ${hasSec}`;
}

export default function AppointmentNew() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const doctorId = params.get("doctorId");

  // doctor fetch
  const [doctor, setDoctor] = useState(null);
  const [docErr, setDocErr] = useState("");
  const [docLoading, setDocLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) {
      setDoctor(null);
      setDocLoading(false);
      return;
    }
    setDocErr("");
    setDocLoading(true);

    api
      .get(`/doctors/by-id/${doctorId}`)
      .then((res) => {
        const item = res.data?.item || null;
        setDoctor(item);
        if (!item) setDocErr("Doctor not found.");
      })
      .catch(() => {
        setDoctor(null);
        setDocErr("Could not fetch doctor data.");
      })
      .finally(() => setDocLoading(false));
  }, [doctorId]);

  // patient fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [dob, setDob]             = useState(""); // YYYY-MM-DD
  const [email, setEmail]         = useState("");
  const [phone, setPhone]         = useState("");
  const [gender, setGender]       = useState("");

  const fullName = useMemo(() => {
    const fn = `${firstName || ""} ${lastName || ""}`.trim();
    return fn || null;
  }, [firstName, lastName]);

  // schedule
  const [date, setDate] = useState("");                
  const [booked, setBooked] = useState([]);            
  const [selectedTime, setSelectedTime] = useState(""); 

  const availableSlots = useMemo(
    () => ALL_SLOTS.filter((t) => !booked.includes(t)),
    [booked]
  );

  // submit state
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  // when doctor/date changes: refresh booked slots; skip weekends
  useEffect(() => {
    setSelectedTime("");
    if (!doctorId || !date || isWeekend(date)) {
      setBooked([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/appointments/doctor/${doctorId}/booked`, { params: { date } });
        if (!cancelled) {
          const times = Array.isArray(data?.booked) ? data.booked : [];
          setBooked(times);
        }
      } catch {
        if (!cancelled) setBooked([]);
      }
    })();
    return () => { cancelled = true; };
  }, [doctorId, date]);

  const canSubmit = !!doctorId && !!date && !isWeekend(date) && !!selectedTime && !submitting;

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const scheduled = toMySQLFromParts(date, selectedTime);

      const payload = {
        doctor_id: Number(doctorId),
        scheduled_at: scheduled,
        reason: null,
        patient: {
          first_name: firstName || null,
          last_name: lastName || null,
          name: fullName,
          dob: dob || null,
          email: email || null,
          phone: phone || null,
          gender: gender || null,
        },
      };

      await api.post("/appointments", payload);
      setOk("Appointment saved successfully.");
      navigate("/search");
    } catch (e) {
      const s = e?.response?.status;
      if (s === 409) setErr("This time is already booked for this doctor. Please select another slot.");
      else setErr(e?.response?.data?.message || "Could not save appointment. Please check fields or try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen">
      {/* HEADER */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-50 via-sky-50 to-white" />
        <div className="pointer-events-none absolute -top-16 -left-20 h-56 w-56 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-10 h-56 w-56 rounded-full bg-sky-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm">
            <span>🩺</span> Appointment
          </div>

          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Book Appointment
          </h1>
          <p className="mt-2 text-slate-600">
            {docLoading ? "Loading doctor data…" : "Fill in patient information and select a free time slot (weekdays only)."}
          </p>

          {/* Doctor info card */}
          <div className="mt-5 rounded-2xl border border-emerald-100 bg-white/80 backdrop-blur px-4 py-4 sm:px-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-white font-bold">
                {initials(doctor?.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">
                  {doctor?.name ?? "—"}
                </p>
                <p className="truncate text-sm text-slate-600">
                  {doctor?.specialty ? `Specialty: ${doctor.specialty}` : "—"}
                  {doctor?.city ? ` • ${doctor.city}` : ""}
                </p>
              </div>
              <div className="ml-auto">
                <Link
                  to="/search"
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                >
                  ⟵ Back to Search
                </Link>
              </div>
            </div>
            {docErr && <p className="mt-2 text-xs text-rose-600">{docErr}</p>}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-16">
        {/* decoration */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#f0fdf4_25%,transparent_25%),linear-gradient(225deg,#f0fdf4_25%,transparent_25%),linear-gradient(45deg,#f0fdf4_25%,transparent_25%),linear-gradient(315deg,#f0fdf4_25%,#ffffff_25%)] bg-[length:40px_40px] opacity-40" />
          <div className="absolute -top-40 -left-32 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
        </div>

        {err && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
            {err}
          </div>
        )}
        {ok && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
            {ok}
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {/* 1) Patient Information */}
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
              1
            </span>
            <h2 className="text-lg font-semibold text-slate-900">Patient Information</h2>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                placeholder="e.g. John"
                required
              />
              <p className="mt-1 text-[11px] text-slate-500">Enter the patient’s legal first name.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                placeholder="e.g. Smith"
                required
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
              >
                <option value="">—</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                placeholder="e.g. patient@example.com"
              />
              <p className="mt-1 text-[11px] text-slate-500">Used for appointment notifications.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                placeholder="+383 xx xxx xxx"
              />
            </div>
          </div>

          {fullName && (
            <p className="mt-3 text-xs text-slate-500">
              Full name to be saved: <b>{fullName}</b>
            </p>
          )}

          {/* 2) Appointment Time */}
          <div className="mt-8 flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
              2
            </span>
            <h2 className="text-lg font-semibold text-slate-900">Appointment Time</h2>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full sm:w-64 rounded-xl border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
              required
            />
          </div>

          {!date || isWeekend(date) ? null : (
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Time</label>

              {availableSlots.length === 0 ? (
                <div className="text-sm text-rose-600">No available slots on this day.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {availableSlots.map((t) => {
                    const selected = selectedTime === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTime(t)}
                        className={[
                          "rounded-xl border px-3 py-2 text-sm shadow-sm",
                          selected
                            ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
                        ].join(" ")}
                        aria-pressed={selected}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedTime && (
                <p className="mt-2 text-xs text-emerald-700">
                  Appointment will be reserved on <b>{date}</b> at <b>{selectedTime}</b>
                </p>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-white text-sm font-semibold shadow-sm hover:bg-emerald-700 active:scale-[.99] disabled:opacity-60"
              title={!canSubmit ? "Select a weekday and free time slot" : undefined}
            >
              {submitting ? "Saving…" : "Save Appointment"}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <span className="ml-auto text-[11px] text-slate-500">
              🔒 Të dhënat ruhen në mënyrë të sigurt sipas politikave të projektit.
            </span>
          </div>
        </form>
      </section>
    </main>
  );
}
