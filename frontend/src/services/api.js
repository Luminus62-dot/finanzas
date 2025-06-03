// frontend/src/services/api.js
import axios from "axios";

// La URL base para las llamadas API provendrá de la variable de entorno
const API_BASE_URL =
  process.env.REACT_APP_RENDER_BACKEND_URL || "http://localhost:5001"; // Fallback para desarrollo local

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`, // Añadimos /api aquí si todas tus rutas de backend lo usan
});

// Interceptor para añadir el token de autorización a las peticiones
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
