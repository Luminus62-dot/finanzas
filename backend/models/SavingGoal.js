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
    // La unicidad se garantiza mediante un índice compuesto por usuario
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

// Índice compuesto para que cada usuario tenga metas con nombres únicos
SavingGoalSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("SavingGoal", SavingGoalSchema);
