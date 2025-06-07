// File: backend/server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;

// Configurar CORS usando variable de entorno FRONTEND_URL
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
app.use(
  cors({
    origin: FRONTEND_URL,
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

app.get("/", (req, res) => {
  res.send("API de Mi Dinero Hoy funcionando!");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
