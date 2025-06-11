// backend/models/User.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: false,
    trim: true,
  },
  lastName: {
    type: String,
    required: false,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: false,
  },
  profilePictureUrl: {
    type: String,
    required: false,
    // Se usa picsum.photos porque placeholder.com fallaba en el dashboard
    default: "https://picsum.photos/100", // Imagen por defecto
  },
  bannerUrl: {
    type: String,
    required: false,
    // Banner genérico desde picsum.photos
    default: "https://picsum.photos/800/150", // Imagen por defecto
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);
