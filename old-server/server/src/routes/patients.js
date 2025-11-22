

const express = require("express");
const bcrypt = require("bcryptjs");
const { pool } = require("../db");
const { requireAuth, requireRole } = require("../middlewares/auth");
const r = express.Router();

// LIST (ADMIN)
r.get("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.id, u.email, u.role, p.name, p.dob
     FROM patients p JOIN users u ON u.id=p.user_id ORDER BY p.id DESC`
  );
  res.json(rows);
});

// CREATE (ADMIN)  body: { email, password, name, dob }
r.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { email, password, name, dob } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "email/password required" });
  const [dupe] = await pool.query("SELECT id FROM users WHERE email=?", [email]);
  if (dupe.length) return res.status(409).json({ message: "email exists" });

  const hash = bcrypt.hashSync(password, 10);
  const [u] = await pool.query("INSERT INTO users (email,password,role) VALUES (?,?,?)",
    [email, hash, "PATIENT"]);
  await pool.query("INSERT INTO patients (user_id,name,dob) VALUES (?,?,?)",
    [u.insertId, name || null, dob || null]);
  res.status(201).json({ id: u.insertId, email, role: "PATIENT", name, dob });
});


// DELETE (ADMIN)  /patients/:id
r.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ message: "invalid id" });

  // gjej user_id nga patients
  const [[p]] = await pool.query("SELECT user_id FROM patients WHERE id=?", [id]);
  if (!p) return res.status(404).json({ message: "patient not found" });

  // transaksion për fshirje të sigurt
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query("DELETE FROM patients WHERE id=?", [id]);
    await conn.query("DELETE FROM users WHERE id=?", [p.user_id]);
    await conn.commit();
    res.json({ ok: true, id });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ message: "delete failed" });
  } finally {
    conn.release();
  }
});

// ==== SHTO POSHTË NË FUND TË FILE-IT (para module.exports) ====

/* Helpers */
async function ensurePatientForUser(user) {
  // krijo pacient nëse mungon
  const [[p]] = await pool.query("SELECT * FROM patients WHERE user_id = ? LIMIT 1", [user.id]);
  if (p) return p;

  // përpiqu të ndajë emrin nga user.email (opsionale)
  const email = user.email || null;
  await pool.query(
    "INSERT INTO patients (user_id, email) VALUES (?, ?)",
    [user.id, email]
  );
  const [[np]] = await pool.query("SELECT * FROM patients WHERE user_id = ? LIMIT 1", [user.id]);
  return np;
}

/* -------- PATIENT: merr profilin tim -------- */
// GET /patients/me
r.get("/me", requireAuth, requireRole("PATIENT"), async (req, res) => {
  try {
    const p = await ensurePatientForUser(req.user);
    // formatim i DOB për input type="date"
    const [[row]] = await pool.query(
      `
      SELECT 
        id, user_id, 
        first_name, last_name, name,
        email, phone, gender,
        DATE_FORMAT(dob, '%Y-%m-%d') AS dob
      FROM patients
      WHERE id = ?
      `,
      [p.id]
    );
    res.json(row);
  } catch (err) {
    console.error("GET /patients/me error:", err);
    res.status(500).json({ message: "Failed to load patient profile" });
  }
});

/* -------- PATIENT: përditëso profilin tim -------- */
// PUT /patients/me
// body: { first_name?, last_name?, name?, dob?, email?, phone?, gender? }
r.put("/me", requireAuth, requireRole("PATIENT"), async (req, res) => {
  try {
    const p = await ensurePatientForUser(req.user);
    const {
      first_name = null,
      last_name  = null,
      name       = null,
      dob        = null,
      email      = null,
      phone      = null,
      gender     = null, // "Male" | "Female" | null
    } = req.body || {};

    if (gender && gender !== "Male" && gender !== "Female") {
      return res.status(400).json({ message: "gender duhet 'Male' ose 'Female'" });
    }

    await pool.query(
      `
      UPDATE patients
      SET first_name = ?, last_name = ?, name = ?, dob = ?, email = ?, phone = ?, gender = ?
      WHERE id = ?
      `,
      [first_name, last_name, name, dob, email, phone, gender, p.id]
    );

    const [[row]] = await pool.query(
      `
      SELECT 
        id, user_id, 
        first_name, last_name, name,
        email, phone, gender,
        DATE_FORMAT(dob, '%Y-%m-%d') AS dob
      FROM patients
      WHERE id = ?
      `,
      [p.id]
    );

    res.json(row);
  } catch (err) {
    console.error("PUT /patients/me error:", err);
    res.status(500).json({ message: "Failed to update patient profile" });
  }
});

/* -------- PATIENT: takimet e mia -------- */
// GET /patients/me/appointments
r.get("/me/appointments", requireAuth, requireRole("PATIENT"), async (req, res) => {
  try {
    const [[p]] = await pool.query("SELECT id FROM patients WHERE user_id = ? LIMIT 1", [req.user.id]);
    if (!p) return res.json([]); // në praktikë s'duhet të ndodhë falë ensurePatientForUser

    const [rows] = await pool.query(
      `
      SELECT 
        a.id, a.doctor_id, a.patient_id, a.scheduled_at, a.status, a.reason,
        d.name AS doctor_name, d.specialty AS doctor_specialty, d.city AS doctor_city
      FROM appointments a
      JOIN doctors d ON d.id = a.doctor_id
      WHERE a.patient_id = ?
      ORDER BY a.scheduled_at DESC, a.id DESC
      LIMIT 200
      `,
      [p.id]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET /patients/me/appointments error:", err);
    res.status(500).json({ message: "Failed to load appointments" });
  }
});

module.exports = r;
