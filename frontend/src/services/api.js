import axios from "axios";
import API_URL from "../config";

const api = axios.create({
  baseURL: API_URL,
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
