// server/src/routes/doctors.js
const express = require("express");
const bcrypt = require("bcryptjs");
const { pool } = require("../db");
const { requireAuth, requireRole } = require("../middlewares/auth");

const r = express.Router();

/* ---------------------- PUBLIC SEARCH (no auth) ---------------------- */
// GET /doctors/search?specialty=...&city=...
// kthen { items: [ { id, email, role, name, specialty, city } ] } me max 1 rekord
// GET /doctors/search?specialty=...  (PUBLIC)
r.get("/search", async (req, res) => {
  try {
    const specialty = String(req.query.specialty || "").trim().toLowerCase();

    const where = [];
    const args  = [];

    if (specialty) {
      // lejo partial match: "cardio" -> "Cardiology"
      where.push("LOWER(d.specialty) LIKE ?");
      args.push(`%${specialty}%`);
    }

    const sql = `
      SELECT d.id, u.email, u.role, d.name, d.specialty, d.city
      FROM doctors d
      JOIN users u ON u.id = d.user_id
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY d.id DESC
      LIMIT 50
    `;

    const [rows] = await pool.query(sql, args);
    res.json({ items: rows });
  } catch (err) {
    console.error("DOCTORS SEARCH ERROR:", err);
    res.status(500).json({ message: "Search failed" });
  }
});
/* ---------------------- PUBLIC: get one doctor by id ---------------------- */
// GET /doctors/by-id/:id  -> { item: { id, email, role, name, specialty, city } }
r.get("/by-id/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const [rows] = await pool.query(
      `
      SELECT d.id, u.email, u.role, d.name, d.specialty, d.city
      FROM doctors d
      JOIN users u ON u.id = d.user_id
      WHERE d.id = ?
      LIMIT 1
      `,
      [id]
    );

    if (!rows.length) return res.status(404).json({ message: "Doctor not found" });
    res.json({ item: rows[0] });
  } catch (err) {
    console.error("GET /doctors/by-id/:id error:", err);
    res.status(500).json({ message: "Failed to load doctor" });
  }
});
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------- */

/* ------------------------- ADMIN: LIST -------------------------------- */
// GET /doctors  (ADMIN)
r.get("/", requireAuth, requireRole("ADMIN"), async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT d.id, u.email, u.role, d.name, d.specialty, d.city
     FROM doctors d JOIN users u ON u.id = d.user_id
     ORDER BY d.id DESC`
  );
  res.json(rows);
});
/* ---------------------------------------------------------------------- */

/* ------------------------- ADMIN: CREATE ------------------------------ */
// POST /doctors  body: { email, password, name, specialty }
r.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { email, password, name, specialty } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "email/password required" });

  const [dupe] = await pool.query("SELECT id FROM users WHERE email=?", [email]);
  if (dupe.length) return res.status(409).json({ message: "email exists" });

  const hash = bcrypt.hashSync(password, 10);
  const [u] = await pool.query(
    "INSERT INTO users (email,password,role) VALUES (?,?,?)",
    [email, hash, "DOCTOR"]
  );

  await pool.query(
    "INSERT INTO doctors (user_id,name,specialty,city) VALUES (?,?,?,?)",
    [u.insertId, name || null, specialty || null, null] // city opsionale; mund ta shtosh më vonë me UPDATE
  );

  res.status(201).json({ id: u.insertId, email, role: "DOCTOR", name, specialty });
});
/* ---------------------------------------------------------------------- */



/* ---------------------- ADMIN: DELETE DOCTOR ---------------------- */
// DELETE /doctors/:id  (ADMIN) – fshin doktorin + user-in + varësitë bazike
r.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ message: "Invalid id" });

    // gjej user_id për këtë doktor
    const [[doc]] = await pool.query("SELECT user_id FROM doctors WHERE id=?", [id]);
    if (!doc) return res.status(404).json({ message: "Doctor not found" });

    // nëse nuk ke ON DELETE CASCADE, pastro varësitë bazike:
    await pool.query("DELETE FROM diagnoses   WHERE doctor_id=?", [id]);
    await pool.query("DELETE FROM appointments WHERE doctor_id=?", [id]);
    await pool.query("UPDATE patients SET created_by_doctor_id=NULL WHERE created_by_doctor_id=?", [id]);

    // fshi doctor + user
    await pool.query("DELETE FROM doctors WHERE id=?", [id]);
    await pool.query("DELETE FROM users   WHERE id=?", [doc.user_id]);

    res.json({ ok: true, id });
  } catch (err) {
    console.error("DELETE /doctors/:id error:", err);
    res.status(500).json({ message: "Failed to delete doctor" });
  }
});




/* ---------------------- DOCTOR: helpers ---------------------- */
async function getDoctorIdByUserId(pool, userId) {
  const [rows] = await pool.query("SELECT id FROM doctors WHERE user_id = ?", [userId]);
  return rows.length ? rows[0].id : null;
}

/* ---------------------- DOCTOR: pacientët e mi ---------------------- */
r.get("/me/patients", requireAuth, requireRole("DOCTOR"), async (req, res) => {
  try {
    const [[doc]] = await pool.query("SELECT id FROM doctors WHERE user_id = ?", [req.user.id]);
    if (!doc) return res.status(404).json({ message: "Doctor not found" });


const [rows] = await pool.query(
  `
  SELECT DISTINCT
    p.id,
    p.first_name AS firstName,
    p.last_name  AS lastName,
    p.email,
    p.phone,
    p.gender,
    DATE_FORMAT(p.dob, '%Y-%m-%d') AS dob
  FROM patients p
  LEFT JOIN appointments a
    ON a.patient_id = p.id AND a.doctor_id = ?
  WHERE a.id IS NOT NULL OR p.created_by_doctor_id = ?
  ORDER BY p.id DESC
  LIMIT 100
  `,
  [doc.id, doc.id]
);


    res.json({ items: rows });
  } catch (err) {
    console.error("GET /doctors/me/patients error:", err);
    res.status(500).json({ message: "Failed to load patients" });
  }
});


/* ---------------- DOCTOR: takimet e mia ---------------- */
// GET /doctors/me/appointments  (DOCTOR)
r.get("/me/appointments", requireAuth, requireRole("DOCTOR"), async (req, res) => {
  try {
    const [[doc]] = await pool.query(
      "SELECT id FROM doctors WHERE user_id = ?",
      [req.user.id]
    );
    if (!doc) return res.status(404).json({ message: "Doctor not found" });


      const [rows] = await pool.query(`
        SELECT 
          a.*,
          p.first_name AS patientFirstName,
          p.last_name  AS patientLastName,
          p.email      AS patientEmail
        FROM appointments a
        JOIN patients p ON p.id = a.patient_id
        WHERE a.doctor_id = ?
        ORDER BY a.id DESC
        LIMIT 100
      `, [doc.id]);


    res.json({ items: rows });
  } catch (err) {
    console.error("DOCTOR /me/appointments error:", err);
    res.status(500).json({ message: "Failed to load appointments" });
  }
});


/* ---------------------- DOCTOR: diagnozat e mia ---------------------- */
// GET /doctors/me/diagnoses  (DOCTOR)
r.get("/me/diagnoses", requireAuth, requireRole("DOCTOR"), async (req, res) => {
  try {
    const doctorId = await getDoctorIdByUserId(pool, req.user.id);
    if (!doctorId) return res.status(404).json({ message: "Doctor not found" });

    const [rows] = await pool.query(`
      SELECT d.id, d.patient_id, d.doctor_id, d.title, d.description, d.created_at
      FROM diagnoses d
      WHERE d.doctor_id = ?
      ORDER BY d.created_at DESC
      LIMIT 100
    `, [doctorId]);

    res.json({ items: rows });
  } catch (err) {
    console.error("DOCTOR /me/diagnoses error:", err);
    res.status(500).json({ message: "Failed to load diagnoses" });
  }
});


/* ------------- DOCTOR: krijo pacient ------------- */
r.post("/me/patients", requireAuth, requireRole("DOCTOR"), async (req, res) => {
  try {
    const { first_name, last_name, dob, email, phone, gender } = req.body || {};
    if (!first_name || !last_name || !dob || !gender) {
      return res.status(400).json({ message: "first_name, last_name, dob, gender janë të detyrueshme" });
    }
    if (gender !== "Male" && gender !== "Female") {
      return res.status(400).json({ message: "gender duhet 'Male' ose 'Female'" });
    }

  
    const [[doc]] = await pool.query("SELECT id FROM doctors WHERE user_id = ?", [req.user.id]);
    if (!doc) return res.status(404).json({ message: "Doctor not found" });

  
    const [ins] = await pool.query(
      `INSERT INTO patients (first_name, last_name, dob, email, phone, gender, created_by_doctor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, dob, email || null, phone || null, gender, doc.id]
    );

    const [rows] = await pool.query(`SELECT * FROM patients WHERE id = ?`, [ins.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("POST /doctors/me/patients error:", err);
    res.status(500).json({ message: "Failed to create patient" });
  }
});


/* ------------- DOCTOR: krijo diagnozë ------------- */
// POST /doctors/me/diagnoses
// body: { patient_id, title, description }
r.post("/me/diagnoses", requireAuth, requireRole("DOCTOR"), async (req, res) => {
  try {
    const { patient_id, title, description } = req.body || {};
    if (!patient_id || !title) {
      return res.status(400).json({ message: "patient_id dhe title janë të detyrueshme" });
    }

    // gjej doctorId nga përdoruesi i loguar
    const [[doc]] = await pool.query("SELECT id FROM doctors WHERE user_id = ?", [req.user.id]);
    if (!doc) return res.status(404).json({ message: "Doctor not found" });

    // verifiko që mjeku mund ta shohë këtë pacient
    const [[ok]] = await pool.query(
      `
      SELECT 1
      FROM patients p
      LEFT JOIN appointments a
        ON a.patient_id = p.id AND a.doctor_id = ?
      WHERE p.id = ?
        AND (p.created_by_doctor_id = ? OR a.id IS NOT NULL)
      LIMIT 1
      `,
      [doc.id, patient_id, doc.id]
    );
    if (!ok) {
      return res.status(403).json({ message: "Pacienti nuk është i lidhur me këtë mjek" });
    }

    // krijo diagnozën
    const [ins] = await pool.query(
      `INSERT INTO diagnoses (patient_id, doctor_id, title, description)
       VALUES (?,?,?,?)`,
      [patient_id, doc.id, title, description || null]
    );

    // kthe diagnozën e sapo-krijuar (me emrin e pacientit për UI)
    const [rows] = await pool.query(
      `
      SELECT 
        d.id, d.patient_id, d.doctor_id, d.title, d.description, d.created_at,
        p.first_name AS patientFirstName, p.last_name AS patientLastName
      FROM diagnoses d
      JOIN patients p ON p.id = d.patient_id
      WHERE d.id = ?
      `,
      [ins.insertId]
    );

    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error("POST /doctors/me/diagnoses error:", err);
    return res.status(500).json({ message: "Failed to create diagnosis" });
  }
});


/* ------------- DOCTOR: fshi diagnozë ------------- */
// DELETE /doctors/me/diagnoses/:id
r.delete("/me/diagnoses/:id", requireAuth, requireRole("DOCTOR"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const [[doc]] = await pool.query("SELECT id FROM doctors WHERE user_id = ?", [req.user.id]);
    if (!doc) return res.status(404).json({ message: "Doctor not found" });

    // fshi vetëm nëse diagnoza i përket këtij mjeku
    const [del] = await pool.query(
      "DELETE FROM diagnoses WHERE id = ? AND doctor_id = ?",
      [id, doc.id]
    );

    if (del.affectedRows === 0) {
      return res.status(404).json({ message: "Diagnosis not found" });
    }

    res.json({ ok: true, id });
  } catch (err) {
    console.error("DELETE /doctors/me/diagnoses/:id error:", err);
    res.status(500).json({ message: "Failed to delete diagnosis" });
  }
});


/* ------------- DOCTOR: përditëso diagnozë ------------- */
// PUT /doctors/me/diagnoses/:id
// body: { title, description }
r.put("/me/diagnoses/:id", requireAuth, requireRole("DOCTOR"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, description } = req.body || {};
    if (!Number.isInteger(id)) return res.status(400).json({ message: "Invalid id" });
    if (!title || !String(title).trim()) return res.status(400).json({ message: "Title required" });

    const [[doc]] = await pool.query("SELECT id FROM doctors WHERE user_id = ?", [req.user.id]);
    if (!doc) return res.status(404).json({ message: "Doctor not found" });

    const [upd] = await pool.query(
      "UPDATE diagnoses SET title = ?, description = ? WHERE id = ? AND doctor_id = ?",
      [title.trim(), description ?? null, id, doc.id]
    );
    if (upd.affectedRows === 0) return res.status(404).json({ message: "Diagnosis not found" });

    const [rows] = await pool.query(`
      SELECT d.id, d.patient_id, d.doctor_id, d.title, d.description, d.created_at,
             p.first_name AS patientFirstName, p.last_name AS patientLastName
      FROM diagnoses d
      JOIN patients p ON p.id = d.patient_id
      WHERE d.id = ?
    `, [id]);

    res.json(rows[0]);
  } catch (err) {
    console.error("PUT /doctors/me/diagnoses/:id error:", err);
    res.status(500).json({ message: "Failed to update diagnosis" });
  }
});



module.exports = r;
