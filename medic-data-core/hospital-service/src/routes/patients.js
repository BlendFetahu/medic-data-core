// hospital-service/src/routes/patients.js
import express from "express";
import { pool } from "../db/db.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const r = express.Router();

/* ------------------------- 1. LISTA E PACIENTËVE ------------------------- */
// Admini sheh gjithçka, Doktori sheh vetëm pacientët e tij/të regjistruar
r.get("/", requireAuth, async (req, res) => {
  try {
    let sql = "";
    let args = [];

    if (req.user.role === "ADMIN") {
      sql = "SELECT * FROM patients ORDER BY id DESC";
    } else if (req.user.role === "DOCTOR") {
      // Marrim ID-në e doktorit nga users
      const [doc] = await pool.query("SELECT id FROM doctors WHERE user_id = ?", [req.user.sub]);
      if (!doc.length) return res.status(404).json({ message: "Doktori nuk u gjet" });
      
      sql = "SELECT * FROM patients WHERE created_by_doctor_id = ? ORDER BY id DESC";
      args = [doc[0].id];
    } else {
      return res.status(403).json({ message: "Akses i mohuar" });
    }

    const [rows] = await pool.query(sql, args);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë marrjes së pacientëve" });
  }
});

/* ------------------------- 2. KRIJO PACIENT TË RI ------------------------- */
r.post("/", requireAuth, async (req, res) => {
  try {
    const { first_name, last_name, dob, email, phone, gender } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ message: "Emri dhe Mbiemri kërkohen" });
    }

    let doctorId = null;
    if (req.user.role === "DOCTOR") {
      const [doc] = await pool.query("SELECT id FROM doctors WHERE user_id = ?", [req.user.id]);
      if (doc.length) doctorId = doc[0].id;
    }

    const [result] = await pool.query(
      `INSERT INTO patients (first_name, last_name, dob, email, phone, gender, created_by_doctor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, dob, email || null, phone || null, gender, doctorId]
    );

    res.status(201).json({ id: result.insertId, first_name, last_name, message: "Pacienti u regjistrua" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Dështoi regjistrimi i pacientit" });
  }
});

/* ------------------------- 3. DETAJET E NJË PACIENTI ------------------------- */
r.get("/:id", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM patients WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: "Pacienti nuk u gjet" });
    
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Gabim serveri" });
  }
});

/* ------------------------- 4. FSHI PACIENTIN (ADMIN) ------------------------- */
r.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    await pool.query("DELETE FROM patients WHERE id = ?", [req.params.id]);
    res.json({ message: "Pacienti u fshi me sukses" });
  } catch (err) {
    res.status(500).json({ message: "Dështoi fshirja" });
  }
});

export default r;