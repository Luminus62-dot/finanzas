import axios from "axios";

console.log("[DEBUG VERCEL] Leyendo process.env.REACT_APP_BACKEND_URL...");
const RENDER_BACKEND_URL_FROM_ENV = process.env.REACT_APP_BACKEND_URL;

if (RENDER_BACKEND_URL_FROM_ENV) {
  console.log(
    "[INFO VERCEL] REACT_APP_BACKEND_URL tiene valor:",
    RENDER_BACKEND_URL_FROM_ENV
  );
} else {
  console.error("[ERROR VERCEL] ¡REACT_APP_BACKEND_URL ES UNDEFINED O VACÍA!");
  // Podrías incluso lanzar un error aquí para detener la carga si prefieres,
  // o asignar una URL por defecto solo para ver si el resto funciona, pero no es ideal para producción.
  // Ejemplo (NO RECOMENDADO PARA PRODUCCIÓN):
  // if (!RENDER_BACKEND_URL_FROM_ENV) {
  //   console.warn('[WARN VERCEL] Usando URL de fallback porque REACT_APP_BACKEND_URL no está definida.');
  //   RENDER_BACKEND_URL_FROM_ENV = "https://tu-url-de-render-aqui.onrender.com"; // ¡SOLO PARA PRUEBAS!
  // }
}

const api = axios.create({
  baseURL: `${RENDER_BACKEND_URL_FROM_ENV}/api`,
});

console.log("[DEBUG VERCEL] Axios baseURL es:", api.defaults.baseURL);

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
