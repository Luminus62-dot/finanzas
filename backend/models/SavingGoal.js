// backend/models/SavingGoal.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SavingGoalSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId, // El usuario al que pertenece la meta
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true, // El nombre de la meta debe ser único por usuario
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0.01, // El monto objetivo debe ser positivo
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  dueDate: {
    type: Date, // Fecha límite para alcanzar la meta (opcional)
    required: false,
  },
  description: {
    type: String,
    trim: true,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("SavingGoal", SavingGoalSchema);
