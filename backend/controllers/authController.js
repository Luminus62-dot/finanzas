// backend/controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// @route   POST api/auth/register
// @desc    Registrar nuevo usuario
// @access  Public
exports.registerUser = async (req, res) => {
  const { email, password, firstName, lastName, dateOfBirth } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "El usuario ya existe" });
    }

    user = new User({
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Crear y devolver JWT al registrarse (comportamiento original)
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token, msg: "Registro exitoso. ¡Bienvenido!" });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

// @route   POST api/auth/login
// @desc    Autenticar usuario y obtener token
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Credenciales inválidas" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Credenciales inválidas" });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

// @route   PUT api/auth/change-password
// @desc    Cambiar la contraseña del usuario
// @access  Private
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ msg: "La contraseña actual es incorrecta" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ msg: "Contraseña actualizada exitosamente" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

// @route   GET api/auth
// @desc    Obtener datos del usuario autenticado (con token)
// @access  Private
exports.getUser = async (req, res) => {
  try {
    // req.user.id viene del middleware de autenticación (auth.js)
    const user = await User.findById(req.user.id).select("-password"); // Excluir solo la contraseña
    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};
// @route   PUT api/auth/profile-picture
// @desc    Subir y actualizar la URL de la foto de perfil del usuario
// @access  Private
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      // req.file es añadido por Multer si la subida es exitosa
      return res
        .status(400)
        .json({ msg: "No se ha proporcionado ninguna imagen" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // La URL de la imagen guardada
    // En desarrollo, será algo como /uploads/nombre-del-archivo.jpg
    const imageUrl = `/uploads/${req.file.filename}`;

    user.profilePictureUrl = imageUrl;
    await user.save();

    res.json({
      msg: "Foto de perfil actualizada exitosamente",
      profilePictureUrl: imageUrl,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor al subir foto de perfil");
  }
};

// @route   PUT api/auth/banner
// @desc    Subir y actualizar la URL del banner del usuario
// @access  Private
exports.uploadBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ msg: "No se ha proporcionado ninguna imagen" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    user.bannerUrl = imageUrl;
    await user.save();

    res.json({ msg: "Banner actualizado exitosamente", bannerUrl: imageUrl });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor al subir banner");
  }
};
