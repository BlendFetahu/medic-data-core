import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import axios from "axios";

dotenv.config();
const app = express();
import jwt from "jsonwebtoken";

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

app.use(
  "/api/doctors",
  verifyJWT,
  allowRoles("ADMIN"),
  (req, res) => {
    axios({
      method: req.method,
      url: `${HOSPITAL_SERVICE_URL}${req.originalUrl}`,
      data: req.body,
      headers: req.headers,
    })
      .then(r => res.status(r.status).json(r.data))
      .catch(e => res.status(e.response?.status || 500).json(e.response?.data));
  }
);


app.use(
  "/api/patients",
  verifyJWT,
  allowRoles("ADMIN", "DOCTOR"),
  (req, res) => {
    axios({
      method: req.method,
      url: `${HOSPITAL_SERVICE_URL}${req.originalUrl}`,
      data: req.body,
      headers: req.headers,
    })
      .then(r => res.status(r.status).json(r.data))
      .catch(e => res.status(e.response?.status || 500).json(e.response?.data));
  }
);

app.use(
  "/api/appointments",
  verifyJWT,
  allowRoles("ADMIN", "DOCTOR", "PATIENT"),
  (req, res) => {
    axios({
      method: req.method,
      url: `${HOSPITAL_SERVICE_URL}${req.originalUrl}`,
      data: req.body,
      headers: req.headers,
    })
      .then(r => res.status(r.status).json(r.data))
      .catch(e => res.status(e.response?.status || 500).json(e.response?.data));
  }
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
