// client/src/components/Header.jsx
import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

  // === helpers per auth/role ===
const parseUser = () => {
  const raw = localStorage.getItem("auth:user") || localStorage.getItem("user");
  if (!raw || raw === "null" || raw === "undefined") return null;
  try { return JSON.parse(raw); } catch { return null; }
};

const getRole = () => {
  const u = parseUser();
  return u?.role || null; 
};

const dashboardPathFor = (role) => {
  switch (role) {
    case "ADMIN":  return "/admin/dashboard";
    case "DOCTOR": return "/doctor/dashboard";
    case "PATIENT":return "/patient/dashboard";
    default:       return "/dashboard"; 
  }
};

export default function Header() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const [role, setRole] = useState(
    () => (getRole() ? getRole().toUpperCase() : null)
  );


  // kontrollon edhe çelesat me prefiks "auth:"
  const isLoggedIn = () => {
    const at =
      localStorage.getItem("auth:accessToken") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("jwt") ||
      localStorage.getItem("auth");
    const rt =
      localStorage.getItem("auth:refreshToken") ||
      localStorage.getItem("refreshToken");
    const u = localStorage.getItem("auth:user") || localStorage.getItem("user");
    const hasUser = u && u !== "null" && u !== "undefined";
    return Boolean(at || rt || hasUser);
  };

  const [isAuthed, setIsAuthed] = useState(isLoggedIn());

    useEffect(() => {
      const sync = () => {
        setIsAuthed(isLoggedIn());
        const r = getRole();
        setRole(r ? r.toUpperCase() : null);
      };
      window.addEventListener("storage", sync);
      window.addEventListener("auth-changed", sync);
      return () => {
        window.removeEventListener("storage", sync);
        window.removeEventListener("auth-changed", sync);
      };
    }, []);


  useEffect(() => {
  setIsAuthed(isLoggedIn());
  const r = getRole();
  setRole(r ? r.toUpperCase() : null);
}, [loc.pathname]);


  const NAV = [
    ["Home", "/"],
    ["Appointment", "/search"],
    ["Services", "/services"],
    ["About us", "/about"],
  ];

  return (
    <header className="sticky top-0 z-50 bg-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="my-4 flex items-center justify-between rounded-full bg-white px-4 py-2 ring-1 ring-slate-200 shadow-sm">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-teal-500 shadow flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 12 8 12 10 7 14 17 16 12 20 12" />
              </svg>
            </div>
            <span className="font-semibold text-slate-800">HealthPoint</span>
          </Link>

          <ul className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            {NAV.map(([label, to]) => (
              <li key={label}>
                <NavLink to={to} className="hover:text-slate-900">
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {isAuthed ? (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to={dashboardPathFor(role)}
                className="rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600"
              >
                Dashboard
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="rounded-full px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
                Sign in
              </Link>
              <Link to="/signup" className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">
                Register
              </Link>
            </div>
          )}


          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="md:hidden inline-flex items-center justify-center rounded-full w-10 h-10 ring-1 ring-slate-200 text-slate-700 hover:bg-slate-50"
          >
            {open ? (
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </nav>

        <div className={`md:hidden overflow-hidden transition-[max-height] duration-300 ${open ? "max-h-96" : "max-h-0"}`}>
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm px-4 py-3 mb-4">
            <ul className="flex flex-col gap-3 text-slate-700">
              {NAV.map(([label, to]) => (
                <li key={label}>
                  <NavLink to={to} onClick={() => setOpen(false)} className="block w-full rounded-lg px-2 py-2 hover:bg-slate-50">
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {isAuthed ? (
              <div className="mt-4 flex gap-2">
                <Link
                  to={dashboardPathFor(role)}
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-white text-center hover:bg-teal-600"
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <div className="mt-4 flex gap-2">
                <Link to="/login" onClick={() => setOpen(false)} className="flex-1 rounded-full px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200 text-center hover:bg-slate-50">
                  Sign in
                </Link>
                <Link to="/signup" onClick={() => setOpen(false)} className="flex-1 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white text-center hover:bg-sky-700">
                  Register
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </header>
  );
}
