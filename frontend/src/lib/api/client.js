import axios from "axios";

const BACKEND = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/+$/, "");
export const API_BASE = BACKEND ? `${BACKEND}/api` : "/api";

export const USE_MOCK =
  String(process.env.REACT_APP_USE_MOCK || "false").toLowerCase() === "true";

export const http = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Attach auth token to every request
http.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("krishi-auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      const token = parsed?.state?.token;
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {}
  return config;
});

// Normalize error messages from backend
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Something went wrong";
    const err = new Error(msg);
    err.status = error?.response?.status;
    err.data = error?.response?.data;
    throw err;
  }
);

export const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));
