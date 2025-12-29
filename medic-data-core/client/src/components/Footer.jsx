export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* CONTACT — premium card on the left */}
        <div className="w-full sm:w-auto">
          <div className="rounded-xl border border-gray-200 shadow-sm px-5 py-4">
            <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Contact
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-3 group">
                {/* phone icon */}
                <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.5 3.5l3 2a2 2 0 01.7 2.7l-1 1.7a13 13 0 006.6 6.6l1.7-1a2 2 0 012.7.7l2 3a2 2 0 01-.9 2.8 7.5 7.5 0 01-3.2.8C8.7 23 2 16.3 2 8.2c0-1.1.3-2.2.8-3.2a2 2 0 012.8-.9z" />
                </svg>
                <span className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors">
                  +383 44 123 456
                </span>
              </div>

              <a href="mailto:support@hospital.com" className="flex items-center gap-3 group">
                {/* mail icon */}
                <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
                  <path d="M22 8l-10 7L2 8" />
                </svg>
                <span className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors">
                  healthpoint@gmail.com
                </span>
              </a>

              <div className="flex items-center gap-3">
                {/* location icon */}
                <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                <span className="text-gray-700">
                  Prishtina, Kosovo
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BRAND — gradient heartbeat logo */}
        <a href="#" className="order-first sm:order-none flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-teal-500 shadow-lg flex items-center justify-center">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 12 8 12 10 7 14 17 16 12 20 12" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight text-gray-900">
            HealthPoint
          </span>
        </a>

        {/* COPYRIGHT */}
        <p className="text-sm text-gray-600 text-center sm:text-right">
          © {new Date().getFullYear()} HealthPoint. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
