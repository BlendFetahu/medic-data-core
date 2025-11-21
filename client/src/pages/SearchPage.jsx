// client/src/pages/SearchPage.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api";

const SPECIALTY_OPTIONS = ["General", "Cardiology", "Dermatology", "Pediatrics", "Orthopedics", "Neurology"];

export default function SearchPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // lexon nga URL
  const specialtyParam = (params.get("specialty") || params.get("query") || "").trim();

  // kontrollo inputin e formës
  const [specialtyInput, setSpecialtyInput] = useState(specialtyParam);

  // doctor data
  const [doctors, setDoctors] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // fetch sa herë ndryshon URL
  useEffect(() => {
    const specialty = specialtyParam;
    setErr("");
    setLoading(true);

    const q = new URLSearchParams();
    if (specialty) q.set("specialty", specialty);

    api
      .get(`/doctors/search?${q.toString()}`)
      .then((res) => {
        const list = res.data?.items || [];
        setDoctors(list);
      })
      .catch(() => setErr("Failed to fetch doctors"))
      .finally(() => setLoading(false));
  }, [specialtyParam]);

  // submit i formës -> përditëson URL params
  function onSubmit(e) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (specialtyInput.trim()) q.set("specialty", specialtyInput.trim());
    navigate(`/search?${q.toString()}`);
  }

  const initials = (s) =>
  (s || "")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();


  return (
    <main className="min-h-screen">
      {/* Header me gradient (si landing) */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-50 via-sky-50 to-white" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Find a Specialist
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Choose the care you need — same-day appointments with experienced doctors.
          </p>

          {/* Forma vetëm për specialty (dropdown) */}
          <form
            onSubmit={onSubmit}
            className="mt-6 rounded-2xl border border-emerald-100 bg-white/80 backdrop-blur px-4 py-4 sm:px-6 shadow-sm"
          >
            <div className="grid gap-3 sm:grid-cols-[1fr,auto]">
              <div>
                <label className="block text-sm font-medium text-slate-700">Specialty</label>
                <select
                 className="mt-1 w-full rounded-xl border border-slate-200 px-3  py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                  value={specialtyInput}
                  onChange={(e) => setSpecialtyInput(e.target.value)}
                  required
                >
                  <option value="">Choose Speciality</option>
                  {SPECIALTY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-white text-sm font-semibold shadow-sm hover:bg-emerald-700 active:scale-[.99]"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Meta e kërkimit aktual */}
            <p className="text-slate-600 mt-3">
              Specialty: <b>{specialtyParam || "—"}</b>
            </p>
          </form>
        </div>
      </section>

      {/* Rezultatet */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-14">
        {loading && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
            Loading…
          </div>
        )}

        {err && (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
            {err}
          </div>
        )}

        {!loading && !err && doctors.length === 0 && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
            Nuk u gjet asnjë doktor me këtë specialty.
          </div>
        )}

        {doctors.length > 0 && (
          <>
            <h2 className="mt-10 text-xl font-semibold text-slate-900">Results</h2>
            <div className="mt-4 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition
                            hover:shadow-lg hover:-translate-y-[2px] min-h-[220px]"
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-50" />

                  <div className="relative flex items-center gap-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full
                                    bg-gradient-to-br from-emerald-500 to-sky-500 text-white text-xl font-bold shadow">
                      {initials(doctor.name)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xl font-semibold text-slate-900">
                        {doctor.name}
                      </p>

                      <div className="mt-1 inline-flex items-center gap-2">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                          {doctor.specialty || "—"}
                        </span>
                        {doctor.city && (
                          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-600 ring-1 ring-slate-100">
                            {doctor.city}
                          </span>
                        )}
                      </div>

                      {doctor.email && (
                        <p className="mt-2 text-sm text-slate-600 truncate">
                          Email: {doctor.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ndarës i hollë */}
                  <div className="my-5 h-px w-full bg-slate-100" />

                  {/* footer: CTA i fortë */}
                  <button
                    onClick={() => navigate(`/appointments/new?doctorId=${doctor.id}`)}
                    className="relative w-full rounded-2xl bg-emerald-600 px-5 py-3 text-white text-sm font-semibold
                              shadow ring-1 ring-emerald-500/20 transition hover:bg-emerald-700 active:scale-[.99]"
                  >
                    Cakto takim
                  </button>

                  {/* kontur dinamik në hover që i dallon kartat */}
                  <div className="pointer-events-none absolute inset-0 rounded-3xl ring-0 ring-emerald-300/0 transition group-hover:ring-2 group-hover:ring-emerald-300/40" /></div>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

