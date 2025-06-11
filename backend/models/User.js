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
    default:
      "https://via.placeholder.com/100/ecf0f1/2c3e50?text=Perfil", // Imagen por defecto
  },
  bannerUrl: {
    type: String,
    required: false,
    default:
      "https://via.placeholder.com/800x150/3498db/ffffff?text=Banner", // Imagen por defecto
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);
