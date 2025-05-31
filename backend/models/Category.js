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
    unique: true, // El nombre de la categoría debe ser único por usuario
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

module.exports = mongoose.model("Category", CategorySchema);
