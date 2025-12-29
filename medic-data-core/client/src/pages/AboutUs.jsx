// src/pages/About.jsx
import { Link } from "react-router-dom";

export default function About() {
  return (
    <main className="bg-gray-50 text-slate-900">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 ring-1 ring-white/25">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-300" />
              <span className="text-sm">About Our Clinic</span>
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold leading-tight">
              Compassionate Care. Modern Medicine.
            </h1>
            <p className="mt-4 text-lg text-emerald-50">
              We’re a patient-first clinic offering trusted care in Prishtina. From
              same-day appointments to modern diagnostics, our team is here to make healthcare
              simple, accessible, and human.
            </p>
           
          </div>
        </div>
      </section>

      {/* Mission & Snapshot */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-bold">Our Mission</h2>
              <p className="mt-4 text-slate-600">
                To provide high-quality, evidence-based medical care with empathy and clarity.
                We believe every patient deserves time, attention, and a clear plan.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-6">
                <div className="rounded-2xl border-2 border-emerald-500/70 bg-white p-5">
                  <div className="text-3xl font-extrabold text-emerald-700">10+ yrs</div>
                  <div className="text-sm text-slate-600">Caring for the community</div>
                </div>
                <div className="rounded-2xl border-2 border-emerald-500/70 bg-white p-5">
                  <div className="text-3xl font-extrabold text-emerald-700">20+ </div>
                  <div className="text-sm text-slate-600">Dedicated staff members</div>
                </div>
                <div className="rounded-2xl border-2 border-emerald-500/70 bg-white p-5">
                  <div className="text-3xl font-extrabold text-emerald-700">50k+ </div>
                  <div className="text-sm text-slate-600">Patient visits</div>
                </div>
                <div className="rounded-2xl border-2 border-emerald-500/70 bg-white p-5">
                  <div className="text-3xl font-extrabold text-emerald-700">Same-day</div>
                  <div className="text-sm text-slate-600">Appointments available</div>
                </div>
              </div>
            </div>

            {/* Photo block */}
            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-teal-200 to-emerald-200 opacity-60 blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl ring-1 ring-emerald-200 shadow-xl">
               
                <img
                  src="/Staff.png"
                  alt="Our clinic and team"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center">Our Values</h2>
          <p className="mt-3 text-center text-slate-600 max-w-2xl mx-auto">
            The principles that guide every visit, diagnosis, and treatment.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Value 1 */}
            <div className="group rounded-2xl p-6 bg-white border-2 border-emerald-500/80 shadow-sm transition hover:bg-emerald-700 hover:text-white">
              <div className="mb-4 inline-flex items-center justify-center rounded-xl p-3 bg-emerald-50 text-emerald-700 group-hover:bg-white/20 group-hover:text-white">
                {/* Heart (care) */}
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20.8 11.1C20.8 16.2 12 21 12 21S3.2 16.2 3.2 11.1C3.2 7.8 5.9 5 9.2 5c1.5 0 2.9.6 3.8 1.7C13.9 5.6 15.3 5 16.8 5c3.3 0 6 2.8 6 6.1Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Patient-First</h3>
              <p className="mt-2 text-sm text-slate-600 group-hover:text-emerald-100">
                We listen carefully and tailor care to your needs.
              </p>
            </div>

            {/* Value 2 */}
            <div className="group rounded-2xl p-6 bg-white border-2 border-emerald-500/80 shadow-sm transition hover:bg-emerald-700 hover:text-white">
              <div className="mb-4 inline-flex items-center justify-center rounded-xl p-3 bg-emerald-50 text-emerald-700 group-hover:bg-white/20 group-hover:text-white">
                {/* Shield (quality/safety) */}
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Quality & Safety</h3>
              <p className="mt-2 text-sm text-slate-600 group-hover:text-emerald-100">
                Evidence-based care, strict hygiene, reliable outcomes.
              </p>
            </div>

            {/* Value 3 */}
            <div className="group rounded-2xl p-6 bg-white border-2 border-emerald-500/80 shadow-sm transition hover:bg-emerald-700 hover:text-white">
              <div className="mb-4 inline-flex items-center justify-center rounded-xl p-3 bg-emerald-50 text-emerald-700 group-hover:bg-white/20 group-hover:text-white">
                {/* Clock (access) */}
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v6l4 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Access & Speed</h3>
              <p className="mt-2 text-sm text-slate-600 group-hover:text-emerald-100">
                Same-day appointments and clear, timely communication.
              </p>
            </div>

            {/* Value 4 */}
            <div className="group rounded-2xl p-6 bg-white border-2 border-emerald-500/80 shadow-sm transition hover:bg-emerald-700 hover:text-white">
              <div className="mb-4 inline-flex items-center justify-center rounded-xl p-3 bg-emerald-50 text-emerald-700 group-hover:bg-white/20 group-hover:text-white">
                {/* Monitor (modern) */}
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="4" width="18" height="13" rx="2" />
                  <path d="M7 14l2-4 2 3 2-2 2 3" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Modern Diagnostics</h3>
              <p className="mt-2 text-sm text-slate-600 group-hover:text-emerald-100">
                On-site ultrasound, ECG, and labs for fast results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col items-center text-center">
            <h3 className="text-2xl sm:text-3xl font-bold">
              Ready to book your appointment?
            </h3>
            <p className="mt-2 text-emerald-50 max-w-2xl">
              Find the right specialist and time that works for you.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/search"
                className="rounded-full bg-white px-6 py-3 font-semibold text-emerald-700 shadow hover:bg-emerald-50"
              >
                Choose Your Specialist
              </Link>
             
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
