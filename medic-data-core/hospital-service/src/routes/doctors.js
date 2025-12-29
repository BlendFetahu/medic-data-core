// hospital-service/src/routes/doctors.js
import express from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db/db.js"; 
import { requireAuth, requireRole } from "../middlewares/auth.js";

const r = express.Router();

/**
 * SHËNIM: Ky skedar menaxhon Doktorët, Pacientët dhe Diagnozat.
 * Strukturë e thjeshtë: 1. Admin krijon Doktorin -> 2. Doktori krijon Pacientin/Diagnozën.
 */

/* ---------------------- 1. PUBLIKE: Kërko Doktorë ---------------------- */
r.get("/search", async (req, res) => {
  try {
    const specialty = String(req.query.specialty || "").trim().toLowerCase();
    const sql = `
      SELECT d.id, u.email, d.name, d.specialty
      FROM doctors d
      JOIN users u ON u.id = d.user_id
      ${specialty ? "WHERE LOWER(d.specialty) LIKE ?" : ""}
      ORDER BY d.id DESC LIMIT 50`;

    const [rows] = await pool.query(sql, specialty ? [`%${specialty}%`] : []);
    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: "Search failed" });
  }
});

/* ------------------------- 2. ADMIN: Krijo Doktor ------------------------------ */
r.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const { email, password, name, specialty, phone } = req.body;
    if (!email || !password || !name) return res.status(400).json({ message: "Email, password dhe emri kërkohen" });

    // Kontrollojmë nëse emaili ekziston
    const [dupe] = await pool.query("SELECT id FROM users WHERE email=?", [email]);
    if (dupe.length) return res.status(409).json({ message: "Ky email ekziston në sistem" });

    const hash = bcrypt.hashSync(password, 10);
    
    // 1. Krijojmë User-in (Lidhja me tabelën users)
    const [u] = await pool.query(
      "INSERT INTO users (email, password, role) VALUES (?, ?, 'DOCTOR')",
      [email, hash]
    );

    // 2. Krijojmë detajet e Doktorit
    await pool.query(
      "INSERT INTO doctors (user_id, name, specialization, phone) VALUES (?, ?, ?, ?)",
      [u.insertId, name, specialty || null, phone || null]
    );

    res.status(201).json({ message: "Doktori u krijua me sukses", email, name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Dështoi krijimi i doktorit" });
  }
});

/* ---------------------- 3. DOCTOR: Krijo Pacient ---------------------- */
r.post("/me/patients", requireAuth, requireRole("DOCTOR"), async (req, res) => {
  try {
    const { first_name, last_name, dob, email, phone, gender } = req.body;
    
    // Marrim ID-në e doktorit nga ID-ja e User-it (nga Token-i)
    const [doc] = await pool.query("SELECT id FROM doctors WHERE user_id = ?", [req.user.id]);
    if (!doc.length) return res.status(404).json({ message: "Doktori nuk u gjet" });

    const [ins] = await pool.query(
      `INSERT INTO patients (first_name, last_name, dob, email, phone, gender, created_by_doctor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, dob, email || null, phone || null, gender, doc[0].id]
    );

    res.status(201).json({ id: ins.insertId, first_name, last_name });
  } catch (err) {
    res.status(500).json({ message: "Dështoi krijimi i pacientit" });
  }
});

/* ---------------------- 4. DOCTOR: Krijo Diagnozë ---------------------- */
r.post("/me/diagnoses", requireAuth, requireRole("DOCTOR"), async (req, res) => {
  try {
    const { patient_id, title, description } = req.body;
    const [doc] = await pool.query("SELECT id FROM doctors WHERE user_id = ?", [req.user.id]);

    const [ins] = await pool.query(
      `INSERT INTO diagnoses (patient_id, doctor_id, title, description) VALUES (?,?,?,?)`,
      [patient_id, doc[0].id, title, description || null]
    );

    res.status(201).json({ id: ins.insertId, title });
  } catch (err) {
    res.status(500).json({ message: "Dështoi krijimi i diagnozës" });
  }
});

/* ------------------------- 5. ADMIN: Listë Doktorësh ------------------------- */
r.get("/", requireAuth, async (req, res) => {
  if (req.user.role !== "ADMIN") return res.status(403).json({ message: "Akses i ndaluar" });
  try {
    const [rows] = await pool.query(
      `SELECT d.id, u.email, d.name, d.specialization FROM doctors d JOIN users u ON u.id = d.user_id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

export default r;