// File: backend/controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

// Registrar usuario
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, firstName, lastName, dateOfBirth } =
    req.body;
  if (!username || !email || !password || !firstName || !lastName) {
    return res
      .status(400)
      .json({ message: "Completa todos los campos obligatorios." });
  }

  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    return res.status(400).json({ message: "Usuario o correo ya registrado." });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    firstName,
    lastName,
    dateOfBirth,
  });
  await newUser.save();

  const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.status(201).json({
    token,
    user: {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      dateOfBirth: newUser.dateOfBirth,
    },
  });
});

// Login usuario
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email y contraseña requeridos." });
  }

  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
      },
    });
  }
  res.status(401).json({ message: "Credenciales inválidas." });
});

// Obtener perfil autenticado
const getUser = asyncHandler(async (req, res) => {
  res.json(req.user);
});

module.exports = { registerUser, loginUser, getUser };
