import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Basic test route
app.get("/health", (req, res) => {
  res.json({ status: "hospital-service running" });
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Hospital Service running on port ${PORT}`);
});
