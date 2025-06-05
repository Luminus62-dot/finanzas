// backend/controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

// ... (registerUser y loginUser permanecen igual que antes) ...

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, firstName, lastName, dateOfBirth } =
    req.body;

  if (!username || !email || !password || !firstName || !lastName) {
    res.status(400);
    throw new Error(
      "Por favor, completa todos los campos obligatorios: nombre de usuario, email, contraseña, nombre y apellido."
    );
  }

  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    res.status(400);
    throw new Error("El usuario o el correo electrónico ya existe.");
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

  if (newUser) {
    // No se devuelve token ni se hace login automático aquí, solo la info del usuario creado
    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      dateOfBirth: newUser.dateOfBirth,
    });
  } else {
    res.status(400);
    throw new Error("Datos de usuario inválidos.");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Por favor, ingresa email y contraseña.");
  }

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // O el tiempo que prefieras, ej: '30d'
    );
    res.json({
      token,
      user: {
        // Enviamos los datos del usuario que el frontend podría necesitar
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
      },
    });
  } else {
    res.status(401); // Unauthorized
    throw new Error("Credenciales inválidas.");
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  // Gracias al middleware modificado, req.user ya es el objeto del usuario
  // (o la petición habría sido rechazada antes de llegar aquí).

  // req.user fue establecido por el middleware de autenticación y ya contiene
  // el objeto del usuario sin la contraseña.
  if (req.user) {
    res.json(req.user);
  } else {
    // Este caso no debería ocurrir si el middleware funciona como se espera,
    // ya que el middleware devolvería un 401 si el usuario no se encuentra.
    // Pero lo dejamos como una salvaguarda.
    res.status(404).json({ message: "Usuario no encontrado." });
  }
});

module.exports = { registerUser, loginUser, getUserProfile };
