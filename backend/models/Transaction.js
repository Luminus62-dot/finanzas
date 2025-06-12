const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  type: {
    type: String,
    enum: ["Ingreso", "Gasto", "Transferencia"],
    required: true,
  },
  category: {
    type: String,
    // ¡CAMBIO CLAVE AQUÍ!
    // La categoría es requerida A MENOS QUE el tipo de transacción sea 'Transferencia'.
    required: function () {
      return this.type !== "Transferencia";
    },
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  toAccount: {
    type: Schema.Types.ObjectId,
    ref: "Account",
    required: function () {
      return this.type === "Transferencia";
    },
  },
  subscription: {
    type: Schema.Types.ObjectId,
    ref: "Subscription",
  },
});

module.exports = mongoose.model("Transaction", TransactionSchema);
