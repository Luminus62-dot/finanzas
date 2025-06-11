import axios from "axios";
import API_URL from "../config";

// Todas las llamadas se prefijan con `/api`
const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Interceptor para añadir token en headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
