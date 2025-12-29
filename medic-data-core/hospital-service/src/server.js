import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

// 1. Importo skedarët e rrugëve (routes)
import doctorRoutes from "./routes/doctors.js";
import patientRoutes from "./routes/patients.js";
import appointmentRoutes from "./routes/appointments.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// 2. Lidhi rrugët me serverin
// Kujdes: Gateway e heq "/api", kështu që këtu duhet të jenë direkt
app.use("/doctors", doctorRoutes);
app.use("/patients", patientRoutes);
app.use("/appointments", appointmentRoutes);

// Basic test route
app.get("/health", (req, res) => {
  res.json({ status: "hospital-service running" });
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`🚀 Hospital Service running on port ${PORT}`);
  console.log("✅ Routes loaded: /doctors, /patients, /appointments");
});