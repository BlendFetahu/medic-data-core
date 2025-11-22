import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import axios from "axios";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:5001";
const HOSPITAL_SERVICE_URL = process.env.HOSPITAL_SERVICE_URL || "http://localhost:5002";

// Forward requests to Auth Service
app.use("/auth", (req, res) => {
    const url = `${AUTH_SERVICE_URL}${req.originalUrl.replace("/auth", "")}`;

    axios({
        method: req.method,
        url,
        data: req.body,
        headers: req.headers,
    })
        .then(response => res.status(response.status).json(response.data))
        .catch(error => {
            console.error(error.message);
            res.status(error.response?.status || 500).json(error.response?.data || { error: "Auth service error" });
        });
});

// Forward requests to Hospital Service
app.use("/api", (req, res) => {
    const url = `${HOSPITAL_SERVICE_URL}${req.originalUrl.replace("/api", "")}`;

    axios({
        method: req.method,
        url,
        data: req.body,
        headers: req.headers,
    })
        .then(response => res.status(response.status).json(response.data))
        .catch(error => {
            console.error(error.message);
            res.status(error.response?.status || 500).json(error.response?.data || { error: "Hospital service error" });
        });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
