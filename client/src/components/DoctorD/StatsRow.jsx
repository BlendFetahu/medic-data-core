 function Stat({ label, value, color }) {
  return (
    <div className={`rounded-2xl border p-4 ${color}`}>
      <div className="text-sm opacity-80">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

export default function StatsRow({ patientsCount = 0, appointmentsCount = 0, diagnosesCount = 0 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Stat
        label="Patients"
        value={patientsCount}
        color="bg-emerald-50 text-emerald-700 border-emerald-200"
      />
      <Stat
        label="Appointments"
        value={appointmentsCount}
        color="bg-sky-50 text-sky-700 border-sky-200"
      />
      <Stat
        label="Diagnoses"
        value={diagnosesCount}
        color="bg-amber-50 text-amber-700 border-amber-200"
      />
    </div>
  );
}
