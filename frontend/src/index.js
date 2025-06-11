// frontend/src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Si tienes un archivo CSS global, consérvalo
import "bootstrap/dist/css/bootstrap.min.css"; // Estilos globales de Bootstrap
import "react-toastify/dist/ReactToastify.css"; // <-- NUEVA LÍNEA: Estilos de React-Toastify
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
