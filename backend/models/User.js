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
    // <-- NUEVO: URL de la foto de perfil
    type: String,
    required: false,
  },
  bannerUrl: {
    // <-- NUEVO: URL del banner
    type: String,
    required: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);
