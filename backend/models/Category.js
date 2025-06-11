// backend/models/Category.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId, // El usuario al que pertenece la categoría
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    // La unicidad por usuario se define con un índice compuesto más abajo
  },
  type: {
    type: String,
    enum: ["Ingreso", "Gasto"], // Tipo de categoría: Ingreso o Gasto
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Índice compuesto: nombre de categoría único por usuario y tipo
CategorySchema.index({ user: 1, name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("Category", CategorySchema);
