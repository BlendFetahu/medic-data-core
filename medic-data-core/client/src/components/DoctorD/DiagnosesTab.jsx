import { useMemo, useState } from "react";
import Card from "./Card";
import api from "../../api";

export default function DiagnosesTab({ patients, diagnoses, setDiagnoses, fullName, fmt }) {
  const [form, setForm] = useState({ patientId: "", title: "", description: "" });
  const [diagFilter, setDiagFilter] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });

  // Helper: nxirr emrin e pacientit nga diagnoza (nga backend ose nga lista e pacientëve)
  function nameOf(d) {
    if (d.patientName) return d.patientName;
    const pid = d.patientId ?? d.patient_id;
    const p = patients.find(x => Number(x.id) === Number(pid));
    return p ? fullName(p) : "Unknown";
  }

  // Filtrim i listës sipas emrit të pacientit
  const visibleDiagnoses = useMemo(() => {
    const q = (diagFilter || "").toLowerCase().trim();
    if (!q) return diagnoses;
    return (diagnoses || []).filter(d => nameOf(d).toLowerCase().includes(q));
  }, [diagnoses, diagFilter, patients]);

  const resetDiagForm = () => {
    setForm({ patientId: "", title: "", description: "" });
    setDiagFilter("");
  };

  // === SAVE: thirr backend-in dhe shto në listë rezultatin ===
  async function submitDiagnosis(e) {
    e.preventDefault();
    if (!form.patientId || !form.title.trim()) {
      alert("Select patient and enter title.");
      return;
    }

    try {
      const pid = Number(form.patientId);
      const { data: created } = await api.post("/doctors/me/diagnoses", {
        patient_id: pid,
        title: form.title.trim(),
        description: form.description.trim() || null,
      });

      // Përgatit objektin për UI (me patientName)
      const p = patients.find(x => Number(x.id) === pid);
      const item = {
        id: created.id,
        patientId: created.patient_id,
        patientName:
          `${created.patientFirstName || p?.firstName || ""} ${created.patientLastName || p?.lastName || ""}`.trim() || "Unknown",
        title: created.title,
        description: created.description,
        created_at: created.created_at,
      };

      setDiagnoses(prev => [item, ...prev]);
      resetDiagForm();
    } catch (err) {
      console.error("Create diagnosis failed:", err);
      alert(err?.response?.data?.message || "Failed to create diagnosis");
    }
  }

  function startEdit(d) {
    setEditId(d.id);
    setEditForm({ title: d.title, description: d.description || "" });
  }

  async function saveEdit(e) {
    e.preventDefault();
    const id = editId;
    if (!id) return;
    if (!editForm.title.trim()) { alert("Title is required."); return; }

    try {
      const { data: updated } = await api.put(`/doctors/me/diagnoses/${id}`, {
        title: editForm.title.trim(),
        description: editForm.description.trim() || null,
      });

      const displayName =
        `${updated.patientFirstName || ""} ${updated.patientLastName || ""}`.trim() ||
        (patients.find(p => Number(p.id) === Number(updated.patient_id)) ? fullName(patients.find(p => Number(p.id) === Number(updated.patient_id))) : "Unknown");

      const item = {
        id: updated.id,
        patientId: updated.patient_id,
        patientName: displayName,
        title: updated.title,
        description: updated.description,
        created_at: updated.created_at,
      };

      setDiagnoses(prev => prev.map(d => (d.id === id ? item : d)));
      setEditId(null);
    } catch (err) {
      console.error("Update diagnosis failed:", err);
      alert(err?.response?.data?.message || "Failed to update diagnosis");
    }
  }

  async function deleteDiagnosis(id) {
    if (!confirm("Delete this diagnosis?")) return;
    try {
      await api.delete(`/doctors/me/diagnoses/${id}`);
      setDiagnoses(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error("Delete diagnosis failed:", err);
      alert(err?.response?.data?.message || "Failed to delete diagnosis");
    }
  }

  return (
    <Card title="Diagnoses">
      {/* ====== FORM ====== */}
      <form
        onSubmit={submitDiagnosis}
        className="grid gap-3 grid-cols-1 md:grid-cols-12 items-start mb-4"
      >
        {/* Search + picker */}
        <div className="relative md:col-span-4">
          <input
            className="border p-2.5 rounded w-full"
            placeholder="Search patient…"
            value={diagFilter}
            onChange={e => { setDiagFilter(e.target.value); setShowPicker(true); }}
            onFocus={() => setShowPicker(true)}
            onBlur={() => setTimeout(() => setShowPicker(false), 150)}
          />
          {showPicker && diagFilter && (
            <ul className="absolute z-10 bg-white border rounded shadow mt-1 max-h-48 overflow-y-auto w-full">
              {patients
                .filter(p => fullName(p).toLowerCase().includes(diagFilter.toLowerCase()))
                .slice(0, 8)
                .map(p => (
                  <li
                    key={p.id}
                    onClick={() => {
                      setForm(prev => ({ ...prev, patientId: String(p.id) }));
                      setDiagFilter(fullName(p));
                      setShowPicker(false);
                    }}
                    className="px-3 py-2 cursor-pointer hover:bg-emerald-50"
                  >
                    {fullName(p)}
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Title */}
        <div className="md:col-span-6">
          <input
            className="border p-2.5 rounded w-full"
            placeholder="Diagnosis title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        {/* Save button */}
        <div className="md:col-span-2 md:justify-self-end md:self-stretch">
          <button
            type="submit"
            className="w-full h-full md:h-auto px-4 py-2 rounded bg-amber-500 hover:bg-amber-600 text-white"
          >
            Save
          </button>
        </div>

        {/* Notes / description */}
        <div className="md:col-span-12">
          <textarea
            className="border p-2.5 rounded w-full min-h-[120px]"
            placeholder="Report / notes (long text)…"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </div>
      </form>

      {visibleDiagnoses.length === 0 && (
        <div className="text-sm text-gray-500">No diagnoses match.</div>
      )}

      <ul className="space-y-2">
        {visibleDiagnoses.map(d => {
          const displayName = nameOf(d);
          return (
            <li key={d.id} className="rounded border p-3">
              {editId !== d.id ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{d.title} — {displayName}</div>
                    <div className="text-xs text-gray-600">{fmt(d.created_at)}</div>
                  </div>
                  {d.description && (
                    <div className="text-sm mt-1 whitespace-pre-wrap">{d.description}</div>
                  )}
                  <div className="mt-2 flex gap-2">
                    <button className="text-xs px-3 py-1 rounded bg-sky-600 text-white" onClick={() => startEdit(d)}>Edit</button>
                    <button className="text-xs px-3 py-1 rounded bg-rose-600 text-white" onClick={() => deleteDiagnosis(d.id)}>Delete</button>
                  </div>
                </>
              ) : (
                <form onSubmit={saveEdit} className="flex gap-2 flex-wrap">
                  <input
                    className="border p-2 rounded flex-1 min-w-[220px] w-full sm:w-auto"
                    value={editForm.title}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    required
                  />
                  <textarea
                    className="border p-2 rounded flex-[2] min-h-[100px] w-full"
                    value={editForm.description}
                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  />
                  {/* VETËM KY BUTON NDRYSHUAR: i vogël & kompakt */}
                  <button
                    className="px-4 py-2 text-sm rounded bg-amber-500 hover:bg-amber-600 text-white whitespace-nowrap"
                    type="submit"
                  >
                    Save
                  </button>
                  <button className="text-xs px-3 py-1 rounded bg-gray-200" type="button" onClick={() => setEditId(null)}>
                    Cancel
                  </button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
