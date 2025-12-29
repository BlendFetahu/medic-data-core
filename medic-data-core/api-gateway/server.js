import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

const AUTH_URL = "http://auth-service:5001";
const HOSPITAL_URL = "http://hospital-service:5002";
const JWT_SECRET = process.env.JWT_SECRET || "supersecretaccess";

// Middleware për verifikimin e Token-it
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log("⚠️ Gateway: Nuk u gjet Token në Header");
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("❌ Gateway JWT Error:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// --- Rregullim për 404 te /me ---
app.get("/me", verifyJWT, async (req, res) => {
  console.log("👤 Gateway: Po kërkohen të dhënat e përdoruesit (/me)");
  try {
    const response = await axios.get(`${AUTH_URL}/auth/me`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    console.error("❌ Gabim te Auth Service (/me):", error.message);
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

// --- Rrugët e Autentikimit (/auth/login, /auth/signup) ---
app.use("/auth", async (req, res) => {
  const url = `${AUTH_URL}${req.originalUrl}`;
  console.log(`📡 Gateway drejt Auth: ${url}`);
  try {
    const response = await axios({
      method: req.method,
      url: url,
      data: req.body,
      headers: { 
        "Content-Type": "application/json",
        "Authorization": req.headers.authorization || "" 
      }
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Auth Error" });
  }
});

// --- Rrugët e API (Spitali) ---
app.use("/api", verifyJWT, async (req, res) => {
  const cleanPath = req.originalUrl.replace("/api", "");
  const url = `${HOSPITAL_URL}${cleanPath}`;
  console.log(`🏥 Gateway drejt Hospital: ${url}`);
  
  try {
    const response = await axios({
      method: req.method,
      url: url,
      data: req.body,
      headers: { 
        "Content-Type": "application/json",
        "Authorization": req.headers.authorization || ""
      }
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("❌ Gabim te Hospital Service:", error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Hospital Error" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 API Gateway Online në portin ${PORT}`);
  console.log(`🔑 Duke përdorur JWT_SECRET: ${JWT_SECRET}`);
});