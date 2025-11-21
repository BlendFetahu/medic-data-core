export default function DashboardHeader({ name, specialty, email, onLogout }) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-600 text-white p-5 shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left: identity */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{name}</h1>
          <div className="opacity-90 mt-0.5 text-xs sm:text-sm">Doctor Dashboard</div>
          {specialty ? (
            <div className="opacity-90 mt-0.5 text-xs sm:text-sm">{specialty}</div>
          ) : null}
          {email ? (
            <div className="opacity-90 mt-0.5 text-xs sm:text-sm">{email}</div>
          ) : null}
        </div>

        {/* Right: logout (shown only if handler provided) */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="self-start sm:self-auto px-4 py-2 rounded bg-white/20 hover:bg-white/30 text-white text-sm transition"
          >
            Log out
          </button>
        )}
      </div>
    </div>
  );
}
