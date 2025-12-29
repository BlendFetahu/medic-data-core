import axios from "axios";
import { getAccessToken, getRefreshToken, setAuth, clearAuth, getUser } from "./auth";

// Përcaktojmë portat saktë
const AUTH_URL = "http://localhost:5001";     // Për Login/Register/Refresh
const HOSPITAL_URL = "http://localhost:5002"; // Për Doktorët/Pacientët/Stats

const api = axios.create({ baseURL: HOSPITAL_URL }); // Default shkon te spitali

// 1. Shto Tokenin automatikisht në çdo kërkesë
api.interceptors.request.use((config) => {
  const at = getAccessToken?.();
  if (at) config.headers.Authorization = `Bearer ${at}`;
  return config;
});

let isRefreshing = false;
let queue = [];

function flushQueue(error, newAT = null) {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(newAT)));
  queue = [];
}

// 2. Trajtimi i Refresh Token nëse skadon koha (Porta 5001)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original?._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (newAT) => {
            if (newAT) original.headers.Authorization = `Bearer ${newAT}`;
            resolve(api(original));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      const rt = getRefreshToken?.();
      if (!rt) throw new Error("No refresh token");

      // Refresh bëhet te Auth Service (5001)
      const { data } = await axios.post(`${AUTH_URL}/auth/refresh`, { refreshToken: rt });
      
      const newAT = data.accessToken;
      const newRT = data.refreshToken;
      
      setAuth?.(newAT, newRT, getUser?.());
      flushQueue(null, newAT);
      
      original.headers.Authorization = `Bearer ${newAT}`;
      return api(original);
    } catch (e) {
      flushQueue(e, null);
      try { clearAuth?.(); } catch {}
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;

// --- FUNKSIONET E EKSPORTUARA ME PORTAT E SAKTA ---

/** * LOGIN - Kjo shkon specifishte te PORTA 5001
 */
export async function loginUser(email, password) {
  const { data } = await axios.post(`${AUTH_URL}/auth/login`, { email, password });
  return data;
}

/** * ADMIN ROUTES - Shkojnë te PORTA 5002
 */
export async function getDoctors({ search = "" } = {}) {
  const { data } = await api.get("/api/doctors", { params: { search } });
  return data;
}

export async function createDoctor(payload) {
  const { data } = await api.post("/api/doctors", payload);
  return data;
}

export function deleteDoctor(id) {
  return api.delete(`/api/doctors/${id}`).then((r) => r.data);
}

export async function getPatients({ search = "" } = {}) {
  const { data } = await api.get("/api/patients", { params: { search } });
  return data;
}

export async function deletePatient(id) {
  const { data } = await api.delete(`/api/patients/${id}`);
  return data;
}

export async function getAdminStats() {
  const { data } = await api.get("/api/admin/stats");
  return data;
}

/** * DOCTOR ROUTES - Shkojnë te PORTA 5002
 */
export async function getMyPatients() {
  const { data } = await api.get("/api/doctors/me/patients");
  return data?.items ?? data ?? [];
}

export async function getMyAppointments() {
  const { data } = await api.get("/api/doctors/me/appointments");
  return data?.items ?? data ?? [];
}