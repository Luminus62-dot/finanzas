// File: backend/server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;

// Configurar CORS usando variable de entorno FRONTEND_URL o FRONTEND_URL_REGEX
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const FRONTEND_URL_REGEX = process.env.FRONTEND_URL_REGEX;

let corsOrigin = FRONTEND_URL;

// Si se define FRONTEND_URL_REGEX, usarlo como expresión regular
if (FRONTEND_URL_REGEX) {
  try {
    corsOrigin = new RegExp(FRONTEND_URL_REGEX);
  } catch (err) {
    console.error("FRONTEND_URL_REGEX inválido:", err);
  }
} else if (FRONTEND_URL.includes(",")) {
  // Permitir lista de orígenes separados por comas
  corsOrigin = FRONTEND_URL.split(",").map((url) => url.trim());
}

app.use(
  cors({
    origin: corsOrigin,
  })
);
app.use(express.json());
app.use("/uploads", express.static("uploads"));

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB conectado exitosamente"))
  .catch((err) => console.error("Error de conexión a MongoDB:", err));

// Rutas
app.use("/api/auth", require("./routes/auth"));
app.use("/api/accounts", require("./routes/account"));
app.use("/api/transactions", require("./routes/transaction"));
app.use("/api/categories", require("./routes/category"));
app.use("/api/savinggoals", require("./routes/savingGoal"));
app.use("/api/subscriptions", require("./routes/subscription"));

app.get("/", (req, res) => {
  res.send("API de Mi Dinero Hoy funcionando!");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
