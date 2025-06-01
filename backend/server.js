require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000; // Puerto por defecto

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado exitosamente"))
  .catch((err) => console.error("Error de conexión a MongoDB:", err));

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const accountRoutes = require("./routes/account");
app.use("/api/accounts", accountRoutes);

const transactionRoutes = require("./routes/transaction");
app.use("/api/transactions", transactionRoutes);

const categoryRoutes = require("./routes/category");
app.use("/api/categories", categoryRoutes);

const savingGoalRoutes = require("./routes/savingGoal");
app.use("/api/savinggoals", savingGoalRoutes);

app.get("/", (req, res) => {
  res.send("API de Mi Dinero Hoy funcionando!");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
