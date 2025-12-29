import axios from "axios";
import { getAccessToken } from "./auth";

const AUTH_URL = "http://localhost:5001";
const HOSPITAL_URL = "http://localhost:5002";

// Axios instance për hospital-service (5002)
const api = axios.create({
  baseURL: HOSPITAL_URL,
});

// Interceptor për Authorization header
api.interceptors.request.use((config) => {
  const token = getAccessToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ LOGIN – SHKON TE AUTH SERVICE (5001)
export const loginUser = async (credentials) => {
  const res = await axios.post(`${AUTH_URL}/auth/login`, credentials);
  return res.data;
};

// Doctors
export const getDoctors = async (params) => {
  const { data } = await api.get("/doctors", { params });
  return data;
};

export const createDoctor = async (payload) => {
  const { data } = await api.post("/doctors", payload);
  return data;
};

export const getPatients = async (params) => {
  const { data } = await api.get("/patients", { params });
  return data;
};

export const deleteDoctor = async (id) => {
  const { data } = await api.delete(`/doctors/${id}`);
  return data;
};

// ✅ KJO E ZGJIDH ERRORIN
export default api;
