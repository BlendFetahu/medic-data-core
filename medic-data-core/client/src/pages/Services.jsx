export default function ServicesPage() {
  return (
    <div className="bg-white text-slate-900">
      <HeroClinic />
      <ClinicIntro />
      <ServicesSection />
      <CTASection />
      <FAQ />
      <ContactBand />
    </div>
  );
}

/* ------------------------------ HERO ------------------------------ */
function HeroClinic() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-white to-emerald-100" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
            Your Clinic · Safe care
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Comprehensive medical services,
            <span className="block text-emerald-600">with modern standards</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-600">
            We combine experienced physicians with modern diagnostics for quick visits,
            accurate treatment, and 24/7 follow-up.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-6">
            <Stat title="+20" desc="Specialists" />
            <Stat title="> 50k" desc="Patients treated" />
            <Stat title="4.9/5" desc="Average rating" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ title, desc }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
      <div className="text-2xl font-bold text-emerald-700">{title}</div>
      <div className="mt-1 text-sm text-slate-600">{desc}</div>
    </div>
  );
}

/* --------------------------- CLINIC INTRO -------------------------- */
function ClinicIntro() {
  const bullets = [
    { title: "Human & approachable", desc: "Clear communication, ample time for each visit, and a personalized care plan." },
    { title: "Modern technology", desc: "Ultrasound, ECG, and in-house lab — same-day answers for most tests." },
    { title: "24/7 follow-up", desc: "Round-the-clock phone support for urgent questions and guidance." },
  ];

  return (
    <section className="bg-emerald-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold">Why choose our clinic?</h2>
            <p className="mt-3 text-slate-600">
              We deliver a calm, reliable experience — from quick reception to precise diagnostics
              and dedicated treatment. Great care starts with listening and ends with results.
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {bullets.map((b) => (
                <div key={b.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="font-semibold">{b.title}</h3>
                  <p className="mt-1 text-slate-600 text-sm">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ONE image only, no comment box */}
          <div className="relative">
            <div className="rounded-3xl border border-emerald-200 p-2 shadow-sm bg-white">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl">
                <img
                  src="/ServicesPhoto.png"
                  alt="Our medical team"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
          {/* (Removed the small absolute comment card) */}
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const items = [
    {
      title: "24/7 Phone Support",
      desc: "Speak to our team anytime for urgent questions or guidance.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M22 16.92v2a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.1 4.18 2 2 0 0 1 5.07 2h2a2 2 0 0 1 2 1.72c.1.74.26 1.46.48 2.15a2 2 0 0 1-.45 2.11l-1 1a16 16 0 0 0 6.88 6.88l1-1a2 2 0 0 1 2.11-.45c.69.22 1.41.38 2.15.48A2 2 0 0 1 22 16.92z"/>
        </svg>
      ),
    },
    {
      title: "Same-Day Appointments",
      desc: "Fast scheduling for urgent needs and follow-ups.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
          <path d="M12 14v3l2 1"/>
        </svg>
      ),
    },
    {
      title: "Experienced Specialists",
      desc: "Board-certified doctors with years of clinical experience.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="8" r="4"/>
          <path d="M8 14l-2 7 6-3 6 3-2-7"/>
        </svg>
      ),
    },
    {
      title: "Modern Diagnostics",
      desc: "On-site ultrasound, ECG, and lab tests for quick results.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="13" rx="2"/>
          <path d="M7 14l2-4 2 3 2-2 2 3"/>
          <path d="M8 21h8M12 17v4"/>
        </svg>
      ),
    },
  ];

  return (
    <section id="services" className="bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Our Services</h2>
          <p className="mt-3 text-slate-600">Choose the care you need — our team is ready to help.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ title, desc, icon }) => (
            <div
              key={title}
              className="group rounded-2xl p-6 bg-white text-slate-900 border-2 border-emerald-500/80 shadow-sm transition-all hover:bg-emerald-700 hover:text-white hover:shadow-lg"
            >
              <div className="mb-4 inline-flex items-center justify-center rounded-xl p-3 bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-white/20 group-hover:text-white">
                {icon}
              </div>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-slate-600 group-hover:text-emerald-100">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- CTA ------------------------------- */
function CTASection() {
  return (
    <section id="book" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-3xl border border-emerald-200 bg-emerald-700 p-8 text-white shadow-lg lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold">Ready to book?</h3>
            <p className="mt-2 text-emerald-100">
              Fill out the online form or call us — we usually find a same-day slot.
            </p>
          </div>
          <div className="flex items-center justify-end gap-3">
            <a href="/search" className="rounded-xl bg-white px-5 py-3 font-semibold text-emerald-700 shadow hover:bg-emerald-50">
              Book online
            </a>
            <a href="tel:+38344123456" className="rounded-xl bg-emerald-900/40 px-5 py-3 font-semibold text-white ring-1 ring-white/40 hover:bg-emerald-900/60">
              +383 44 123 456
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- FAQ ------------------------------ */
function FAQ() {
  const faqs = [
    { q: "Do you accept walk-ins?", a: "Yes, for minor urgencies and depending on capacity. We recommend booking ahead." },
    { q: "Do you work with health insurance?", a: "Yes, we partner with several providers. Contact us for details." },
    { q: "How fast will I get results?", a: "Most basic tests are same-day; others typically 24–48 hours." },
  ];
  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h3 className="text-2xl font-bold">Frequently asked questions</h3>
        <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {faqs.map((f, i) => (
            <details key={i} className="group px-6 py-4 open:bg-emerald-50/40">
              <summary className="flex cursor-pointer list-none items-center justify-between py-2 font-medium">
                <span>{f.q}</span>
                <span className="ml-4 text-slate-400 group-open:rotate-180 transition">⌄</span>
              </summary>
              <p className="mt-2 text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- CONTACT BAND ------------------------ */
function ContactBand() {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">Contact</p>
            <p className="text-lg font-semibold">Email us anytime: support@hospital.com</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="mailto:info@your-clinic.com" className="rounded-xl border border-slate-300 px-4 py-2 hover:bg-slate-50">
              Send email
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
