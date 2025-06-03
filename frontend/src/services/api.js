// frontend/src/services/api.js
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_RENDER_BACKEND_URL; // Sin fallback a localhost para producción
console.log("API Base URL for Vercel:", API_BASE_URL); // Para depuración

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
// Este archivo configura Axios para que use la URL base de la API y maneje el token de autenticación automáticamente.
