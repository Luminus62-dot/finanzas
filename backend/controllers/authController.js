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
        profilePictureUrl: user.profilePictureUrl, // Asegúrese de incluir estas en el login
        bannerUrl: user.bannerUrl, // Asegúrese de incluir estas en el login
      },
    });
  }
  res.status(401).json({ message: "Credenciales inválidas." });
});

// Obtener perfil autenticado
const getUser = asyncHandler(async (req, res) => {
  // `req.user` ya contiene el usuario sin la contraseña gracias al middleware `auth`
  res.json(req.user);
});

// Cambiar la contraseña del usuario
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Validaciones básicas de entrada
  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({
        msg: "Por favor, ingrese la contraseña actual y la nueva contraseña.",
      });
  }
  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ msg: "La nueva contraseña debe tener al menos 6 caracteres." });
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ msg: "Usuario no encontrado." });
  }

  // Verificar la contraseña actual
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ msg: "La contraseña actual es incorrecta." });
  }

  // Hashear y guardar la nueva contraseña
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.json({ msg: "Contraseña actualizada exitosamente." });
});

// Subir y actualizar la foto de perfil
const uploadProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: "No se subió ninguna imagen." });
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ msg: "Usuario no encontrado." });
  }

  // La ruta se guarda relativa a la carpeta 'uploads'
  user.profilePictureUrl = `/uploads/${req.file.filename}`;
  await user.save();

  // Devolver la URL completa para el frontend si es necesario
  res.json({
    msg: "Foto de perfil actualizada",
    profilePictureUrl: user.profilePictureUrl,
  });
});

// Subir y actualizar el banner del perfil
const uploadBanner = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: "No se subió ningún banner." });
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ msg: "Usuario no encontrado." });
  }

  // La ruta se guarda relativa a la carpeta 'uploads'
  user.bannerUrl = `/uploads/${req.file.filename}`;
  await user.save();

  // Devolver la URL completa para el frontend si es necesario
  res.json({ msg: "Banner actualizado", bannerUrl: user.bannerUrl });
});

module.exports = {
  registerUser,
  loginUser,
  getUser,
  changePassword, // <-- Exportar esta función
  uploadProfilePicture, // <-- Exportar esta función
  uploadBanner, // <-- Exportar esta función
};
