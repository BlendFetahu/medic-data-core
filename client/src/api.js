// client/src/api.js
import axios from "axios";
import { getAccessToken, getRefreshToken, setAuth, clearAuth, getUser } from "./auth";

const API_BASE = import.meta?.env?.VITE_API_URL || "http://localhost:4000";

const api = axios.create({ baseURL: API_BASE });

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
      const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken: rt });
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

export async function getDoctors({ search = "" } = {}) {
  const { data } = await api.get("/doctors", { params: { search } });
  return data;
}
export async function createDoctor(payload) {
  const { data } = await api.post("/doctors", payload);
  return data;
}
export function deleteDoctor(id) {
  return api.delete(`/doctors/${id}`).then((r) => r.data);
}
export async function getPatients({ search = "" } = {}) {
  const { data } = await api.get("/patients", { params: { search } });
  return data;
}
export async function deletePatient(id) {
  const { data } = await api.delete(`/patients/${id}`);
  return data;
}
export async function getAdminStats() {
  const { data } = await api.get("/admin/stats");
  return data;
}
export async function getMyPatients() {
  const { data } = await api.get("/doctors/me/patients");
  return data?.items ?? data ?? [];
}
export async function getMyAppointments() {
  const { data } = await api.get("/doctors/me/appointments");
  return data?.items ?? data ?? [];
}
export async function getMyDiagnoses() {
  const { data } = await api.get("/doctors/me/diagnoses");
  return data?.items ?? data ?? [];
}
