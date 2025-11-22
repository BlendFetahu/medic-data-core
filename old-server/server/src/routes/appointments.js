// server/src/routes/appointments.js
const express = require("express");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");
const { requireAuth, requireRole } = require("../middlewares/auth");

const r = express.Router();

/* ---------------------------- HELPERS ---------------------------- */
function parseAuthUser(req) {
  // optional auth: decode token if present (route is public)
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

async function doctorExists(doctorId) {
  const [[row]] = await pool.query("SELECT id FROM doctors WHERE id=? LIMIT 1", [doctorId]);
  return !!row;
}

// Accepts "YYYY-MM-DDTHH:mm", ISO, or "YYYY-MM-DD HH:mm[:ss]" → returns "YYYY-MM-DD HH:mm:ss"
function toMySQLDateTime(input) {
  if (!input) return null;
  let v = String(input).trim();

  // Full ISO with Z
  if (/\d{4}-\d{2}-\d{2}.*Z$/.test(v)) {
    const d = new Date(v);
    if (isNaN(d.getTime())) return null;
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = d.getUTCFullYear();
    const mm = pad(d.getUTCMonth() + 1);
    const dd = pad(d.getUTCDate());
    const hh = pad(d.getUTCHours());
    const mi = pad(d.getUTCMinutes());
    const ss = pad(d.getUTCSeconds());
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  }

  // Replace T with space
  v = v.replace("T", " ");

  // Add :00 seconds if missing
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(v)) v = v + ":00";

  // Validate final
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(v)) return null;
  return v;
}

async function getPatientIdByUserId(userId) {
  const [[row]] = await pool.query("SELECT id FROM patients WHERE user_id=? LIMIT 1", [userId]);
  return row?.id ?? null;
}

async function backfillPatientFields(conn, patientId, patientData = {}) {
  const {
    first_name = null,
    last_name  = null,
    name       = null,
    dob        = null,
    email      = null,
    phone      = null,
    gender     = null,
  } = patientData;

  await conn.query(
    `
    UPDATE patients
    SET
      first_name = COALESCE(NULLIF(first_name,''), NULLIF(?,''), first_name),
      last_name  = COALESCE(NULLIF(last_name ,''), NULLIF(?,''), last_name ),
      name       = COALESCE(NULLIF(name      ,''), NULLIF(?,''), name      ),
      dob        = COALESCE(dob, NULLIF(?,''), dob),
      email      = COALESCE(NULLIF(email     ,''), NULLIF(?,''), email     ),
      phone      = COALESCE(NULLIF(phone     ,''), NULLIF(?,''), phone     ),
      gender     = COALESCE(NULLIF(gender    ,''), NULLIF(?,''), gender    )
    WHERE id = ?
    `,
    [first_name, last_name, name, dob, email, phone, gender, patientId]
  );
}

/* ----------------------- CREATE APPOINTMENT ----------------------- */
/**
 * POST /appointments
 * body:
 * {
 *   doctor_id: number (required),
 *   scheduled_at?: "YYYY-MM-DD HH:mm[:ss]" | ISO | "YYYY-MM-DDTHH:mm",
 *   datetime?:     "YYYY-MM-DD HH:mm[:ss]" | ISO | "YYYY-MM-DDTHH:mm", // alias
 *   reason?: string,
 *   patient: { first_name?, last_name?, name?, dob?, email?, phone?, gender? } (required)
 * }
 *
 * Rregullat:
 * - PUBLIC route (pa requireAuth). Nëse ka token PATIENT, lidhet automatikisht me pacientin e kyçur.
 * - Përndryshe, nëse ekziston pacient i regjistruar me atë email (user_id != NULL) → përdoret ai.
 * - Përndryshe krijohet pacient "guest" (pa user) dhe vendoset created_by_doctor_id = doctor_id.
 * - Anti double-booking: s’lejon të njëjtin orar për të njëjtin doktor (status NULL ose 'scheduled').
 */
r.post("/", async (req, res) => {
  try {
    const { doctor_id, scheduled_at, datetime, reason, patient } = req.body || {};
    if (!doctor_id || !patient) {
      return res.status(400).json({ message: "doctor_id dhe patient janë të detyrueshme" });
    }
    const doctorId = Number(doctor_id);
    if (!Number.isInteger(doctorId)) {
      return res.status(400).json({ message: "doctor_id i pavlefshëm" });
    }
    if (!(await doctorExists(doctorId))) {
      return res.status(404).json({ message: "Doktori nuk u gjet" });
    }

    const sched = toMySQLDateTime(scheduled_at || datetime);
    if (!sched) {
      return res.status(400).json({ message: "scheduled_at/datetime i pavlefshëm" });
    }

    const {
      first_name = null,
      last_name  = null,
      name       = null,
      dob        = null,
      email      = null,
      phone      = null,
      gender     = null,
    } = patient || {};

    // Optional auth (route is public)
    const authUser = parseAuthUser(req);

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1) Prefer përdoruesin e kyçur me rol PATIENT
      let patientId = null;
      if (authUser && authUser.role === "PATIENT") {
        const [[pSelf]] = await conn.query(
          "SELECT id FROM patients WHERE user_id=? LIMIT 1",
          [authUser.id]
        );
        if (pSelf) patientId = pSelf.id;
      }

      // 2) Nëse ende s’u gjet dhe ka email → pacient i regjistruar (user_id != NULL)
      if (!patientId && email) {
        const [[reg]] = await conn.query(
          "SELECT id FROM patients WHERE email = ? AND user_id IS NOT NULL LIMIT 1",
          [email]
        );
        if (reg) patientId = reg.id;
      }

      // 3) Përndryshe krijo pacient “guest” (pa user), lidhe me këtë doktor për listim
      if (!patientId) {
        const [insP] = await conn.query(
          `INSERT INTO patients (first_name, last_name, name, dob, email, phone, gender, created_by_doctor_id)
           VALUES (?,?,?,?,?,?,?,?)`,
          [first_name, last_name, name, dob, email, phone, gender, doctorId]
        );
        patientId = insP.insertId;
      }

      // 4) Backfill: plotëso fushat bosh nga formulari (pa mbishkruar ato që ekzistojnë)
      await backfillPatientFields(conn, patientId, patient);

      // 5) Anti double-book
      const [[busy]] = await conn.query(
        `SELECT 1 FROM appointments
         WHERE doctor_id = ? AND scheduled_at = ? AND (status IS NULL OR status='scheduled')
         LIMIT 1`,
        [doctorId, sched]
      );
      if (busy) {
        await conn.rollback();
        return res.status(409).json({ message: "Ky orar është i zënë për këtë doktor." });
      }

      // 6) INSERT appointment
      const [insA] = await conn.query(
        `INSERT INTO appointments (doctor_id, patient_id, scheduled_at, status, reason)
         VALUES (?,?,?,?,?)`,
        [doctorId, patientId, sched, "scheduled", reason ?? null]
      );

      await conn.commit();
      return res.status(201).json({ ok: true, id: insA.insertId });
    } catch (e) {
      try { await conn.rollback(); } catch {}
      if (e?.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Ky orar është i zënë për këtë doktor." });
      }
      console.error("POST /appointments error:", e);
      return res.status(500).json({ message: "Nuk u krijua takimi" });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error("POST /appointments (outer) error:", err);
    res.status(500).json({ message: "Nuk u krijua takimi" });
  }
});

/* -------------- PATIENT: HISTORIKU I TAKIMEVE TË MIJA -------------- */
/**
 * GET /patients/me/appointments   (PATIENT)
 * Kthen takimet e pacientit të loguar (vetëm për ata që kanë user).
 * (Ky endpoint ekziston edhe te routes/patients.js; s’prish punë nëse është dubluar.)
 */
r.get("/patients/me/appointments", requireAuth, requireRole("PATIENT"), async (req, res) => {
  try {
    const patientId = await getPatientIdByUserId(req.user.id);
    if (!patientId) return res.status(404).json({ message: "Patient not found" });

    const [rows] = await pool.query(
      `
      SELECT
        a.id,
        a.doctor_id,
        a.patient_id,
        a.scheduled_at,
        a.status,
        a.reason,
        d.name      AS doctor_name,
        d.specialty AS doctor_specialty,
        d.city      AS doctor_city
      FROM appointments a
      JOIN doctors d ON d.id = a.doctor_id
      WHERE a.patient_id = ?
      ORDER BY a.scheduled_at DESC, a.id DESC
      LIMIT 200
      `,
      [patientId]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET /patients/me/appointments error:", err);
    res.status(500).json({ message: "Failed to load appointments" });
  }
});

/* ------------------- BOOKED SLOTS FOR A DOCTOR --------------------- */
// GET /appointments/doctor/:id/booked?date=YYYY-MM-DD
r.get("/doctor/:id/booked", async (req, res) => {
  try {
    const doctorId = Number(req.params.id);
    const date = String(req.query.date || "").trim();
    if (!Number.isInteger(doctorId) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "Parametra të pavlefshëm" });
    }

    const [rows] = await pool.query(
      `
      SELECT DATE_FORMAT(a.scheduled_at, '%H:%i') AS hhmm
      FROM appointments a
      WHERE a.doctor_id = ?
        AND DATE(a.scheduled_at) = ?
        AND (a.status IS NULL OR a.status = 'scheduled')
      `,
      [doctorId, date]
    );

    const booked = [...new Set(rows.map(r => r.hhmm))];
    res.json({ booked });
  } catch (err) {
    console.error("GET /doctor/:id/booked error:", err);
    res.status(500).json({ message: "Failed to load booked slots" });
  }
});

module.exports = r;
