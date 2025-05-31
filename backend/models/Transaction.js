// backend/models/Transaction.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId, // El usuario al que pertenece la transacción
    ref: "User",
    required: true,
  },
  account: {
    type: Schema.Types.ObjectId, // La cuenta asociada a esta transacción (ej: Efectivo, Banco)
    ref: "Account",
    required: true,
  },
  type: {
    type: String,
    enum: ["Ingreso", "Gasto", "Transferencia"], // Tipos de transacción
    required: true,
  },
  category: {
    type: String, // Categoría de la transacción (ej: Alimentos, Salario, Transporte)
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01, // Las transacciones deben tener un monto positivo
  },
  date: {
    type: Date,
    default: Date.now, // Fecha de la transacción
  },
  // Si la transacción es una 'Transferencia', necesitarás una cuenta de destino
  toAccount: {
    type: Schema.Types.ObjectId,
    ref: "Account",
    required: function () {
      return this.type === "Transferencia";
    }, // Requerido solo si el tipo es 'Transferencia'
  },
});

module.exports = mongoose.model("Transaction", TransactionSchema);
