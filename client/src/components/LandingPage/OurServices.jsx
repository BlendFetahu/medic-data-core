export default function ServicesSection() {
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
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Our Services</h2>
          <p className="mt-3 text-slate-600">
            Choose the care you need — our team is ready to help.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ title, desc, icon }) => (
            <div
              key={title}
              className="
                group rounded-2xl p-6
                bg-white text-slate-900
                border-2 border-emerald-500/80
                shadow-sm transition-all
                hover:bg-emerald-700 hover:text-white hover:shadow-lg
              "
            >
              <div
                className="
                  mb-4 inline-flex items-center justify-center rounded-xl p-3
                  bg-emerald-50 text-emerald-700
                  transition-colors
                  group-hover:bg-white/20 group-hover:text-white
                "
              >
                {icon}
              </div>

              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-slate-600 group-hover:text-emerald-100">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
