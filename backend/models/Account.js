// backend/models/Account.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId, // Relaciona esta cuenta con un usuario específico
    ref: "User", // Hace referencia al modelo 'User'
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true, // Elimina espacios en blanco al inicio/final
    unique: true, // El nombre de la cuenta debe ser único por usuario (consideraremos esto en el controlador)
  },
  type: {
    type: String,
    enum: [
      "Efectivo",
      "Cuenta Bancaria",
      "Tarjeta de Crédito",
      "Ahorros",
      "Inversión",
      "Otro",
    ], // Tipos predefinidos
    default: "Cuenta Bancaria",
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
    required: true,
  },
  currency: {
    type: String,
    default: "USD", // Moneda por defecto (puedes cambiarlo a COP, MXN, etc.)
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Account", AccountSchema);
