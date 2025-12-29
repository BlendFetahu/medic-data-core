import { useState, useMemo } from "react";
import Card from "./Card.jsx";
import api from "../../api";


export default function PatientsTab({ patients, setPatients, fullName }) {
  
  const [search, setSearch] = useState("");
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
  });

 
  const filteredPatients = useMemo(() => {
    const q = (search || "").toLowerCase();
    return (patients || []).filter(p => {
      const fn = (p.firstName || "").toLowerCase();
      const ln = (p.lastName || "").toLowerCase();
      return fn.includes(q) || ln.includes(q) || (fn + " " + ln).includes(q);
    });
  }, [patients, search]);

  
  async function addPatient(e) {
  e.preventDefault();

  const fn  = (newPatient.firstName || "").trim();
  const ln  = (newPatient.lastName || "").trim();
  const g   = (newPatient.gender || "").trim();
  const dob = (newPatient.dob || "").trim();

  if (!fn || !ln) { alert("First name dhe Last name janë të detyrueshme."); return; }
  if (!g)         { alert("Zgjidh gender."); return; }
  if (!dob)       { alert("Date of birth është e detyrueshme."); return; }

  try {
    const { data: created } = await api.post("/doctors/me/patients", {
      first_name: fn,
      last_name:  ln,
      dob,                      
      email: (newPatient.email || "").trim() || null,
      phone: (newPatient.phone || "").trim() || null,
      gender: g,                 
    });

    const p = {
      id: created.id,
      firstName: created.first_name ?? fn,
      lastName:  created.last_name  ?? ln,
      email:     created.email      ?? newPatient.email,
      phone:     created.phone      ?? newPatient.phone,
      gender:    created.gender     ?? g,
      dob:       created.dob        ?? dob,
    };

    setPatients(prev => [p, ...prev]);
    setNewPatient({ firstName:"", lastName:"", email:"", phone:"", gender:"", dob:"" });
    setShowAddPatient(false);
  } catch (err) {
    console.error("Create patient failed:", err);
    alert(err?.response?.data?.message || "Failed to create patient");
  }
}


  return (
    <Card
      title="My Patients"
      right={
        <div className="flex flex-wrap gap-2">
          <input
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="Search…"
            className="border rounded px-3 py-2 text-sm w-full sm:w-auto"
          />
          <button
            onClick={()=>setShowAddPatient(v=>!v)}
            className="w-full sm:w-auto px-3 py-2 rounded bg-amber-500 hover:bg-amber-600 text-white text-sm"
          >
            {showAddPatient ? "Close" : "Add patient"}
          </button>
        </div>
      }
    >
      {showAddPatient && (
        <form onSubmit={addPatient} className="mb-4 grid gap-3 sm:grid-cols-3">
          <input
            className="border p-2 rounded w-full"
            placeholder="First name"
            value={newPatient.firstName}
            onChange={e=>setNewPatient({ ...newPatient, firstName: e.target.value })}
          />
          <input
            className="border p-2 rounded w-full"
            placeholder="Last name"
            value={newPatient.lastName}
            onChange={e=>setNewPatient({ ...newPatient, lastName: e.target.value })}
          />
          <select
            className="border p-2 rounded w-full"
            value={newPatient.gender}
            onChange={e=>setNewPatient({ ...newPatient, gender: e.target.value })}
          >
            <option value="" disabled hidden>Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <input
            type="date"
            className="border p-2 rounded w-full"
            value={newPatient.dob}
            onChange={e=>setNewPatient({ ...newPatient, dob: e.target.value })}
            placeholder="Date of birth"
          />
          <input
            className="border p-2 rounded w-full"
            placeholder="Email (optional)"
            value={newPatient.email}
            onChange={e=>setNewPatient({ ...newPatient, email: e.target.value })}
          />
          <input
            className="border p-2 rounded w-full"
            placeholder="Phone (optional)"
            value={newPatient.phone}
            onChange={e=>setNewPatient({ ...newPatient, phone: e.target.value })}
          />

          <div className="sm:col-span-3">
            <button className="w-full sm:w-auto px-4 py-2 rounded bg-emerald-600 text-white">Save</button>
          </div>
        </form>
      )}

      {filteredPatients.length === 0 && <div className="text-sm text-gray-500">No patients found.</div>}

      <ul className="space-y-2">
        {filteredPatients.map(p => (
          <li key={p.id} className="rounded border p-3">
            <div className="font-medium">{fullName(p)}</div>
            <div className="text-xs text-gray-700">
              {p.gender ? p.gender : "—"}{p.dob ? ` · ${p.dob}` : ""}
            </div>
            <div className="text-xs text-gray-600">
              {(p.email && p.email.trim()) ? p.email : "—"}{(p.phone && p.phone.trim()) ? ` · ${p.phone}` : ""}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
