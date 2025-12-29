// hospital-service/src/routes/appointments.js
import express from "express";
import { pool } from "../db/db.js"; 
import { requireAuth } from "../middlewares/auth.js";

const r = express.Router();

/* ---------------------------- HELPERS ---------------------------- */
function toMySQLDateTime(input) {
    if (!input) return null;
    let v = String(input).trim().replace("T", " ");
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(v)) v = v + ":00";
    return v;
}

/* ----------------------- KRIJO TAKIM (CREATE) ----------------------- */
r.post("/", requireAuth, async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { doctor_id, scheduled_at, reason, patient } = req.body;
        const sched = toMySQLDateTime(scheduled_at);

        if (!doctor_id || !sched) {
            return res.status(400).json({ message: "ID e doktorit dhe data kërkohen" });
        }

        await conn.beginTransaction();

        let patientId = null;

        // 1. Nëse përdoruesi është vetë PACIENT, gjejmë ID-në e tij
        if (req.user.role === "PATIENT") {
            const [[pSelf]] = await conn.query("SELECT id FROM patients WHERE user_id=?", [req.user.id]);
            if (pSelf) patientId = pSelf.id;
        } 
        
        // 2. Nëse është Admin/Doktor dhe po shton një pacient të ri për takimin
        if (!patientId && patient) {
            const [insP] = await conn.query(
                `INSERT INTO patients (first_name, last_name, email, phone) VALUES (?,?,?,?)`,
                [patient.first_name, patient.last_name, patient.email, patient.phone]
            );
            patientId = insP.insertId;
        }

        if (!patientId) {
            await conn.rollback();
            return res.status(400).json({ message: "ID e pacientit nuk u gjet ose të dhënat mungojnë" });
        }

        // 3. Kontrolli për Double-Booking (Doktori nuk mund të ketë 2 takime në të njëjtën kohë)
        const [[busy]] = await conn.query(
            `SELECT 1 FROM appointments WHERE doctor_id = ? AND scheduled_at = ? AND status != 'cancelled' LIMIT 1`,
            [doctor_id, sched]
        );

        if (busy) {
            await conn.rollback();
            return res.status(409).json({ message: "Ky orar është i zënë për këtë doktor." });
        }

        // 4. Ruajtja e Takimit
        const [insA] = await conn.query(
            `INSERT INTO appointments (doctor_id, patient_id, scheduled_at, status, reason) VALUES (?,?,?, 'scheduled', ?)`,
            [doctor_id, patientId, sched, reason || null]
        );

        await conn.commit();
        res.status(201).json({ id: insA.insertId, message: "Takimi u rezervua me sukses" });

    } catch (err) {
        await conn.rollback();
        console.error("APPOINTMENT ERROR:", err);
        res.status(500).json({ message: "Gabim gjatë procesimit të takimit" });
    } finally {
        conn.release();
    }
});

/* ------------------- LISTA E TAKIMEVE (GET) ------------------- */
r.get("/", requireAuth, async (req, res) => {
    try {
        let sql = `
            SELECT a.id, a.scheduled_at, a.status, a.reason,
                   d.name AS doctor_name, 
                   p.first_name AS patient_first_name, p.last_name AS patient_last_name
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            JOIN patients p ON a.patient_id = p.id
        `;
        const params = [];

        if (req.user.role === "DOCTOR") {
            sql += ` WHERE d.user_id = ?`;
            params.push(req.user.id);
        } else if (req.user.role === "PATIENT") {
            sql += ` WHERE p.user_id = ?`;
            params.push(req.user.id);
        }

        sql += ` ORDER BY a.scheduled_at ASC`;

        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Gabim në leximin e takimeve" });
    }
});

export default r;