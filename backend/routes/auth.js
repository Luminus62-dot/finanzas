// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth"); // Middleware de autenticación
const multer = require("multer"); // Para manejar la subida de archivos
const path = require("path"); // Para trabajar con rutas de archivos

// Configuración de Multer para el almacenamiento de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // La carpeta 'uploads' debe existir en la raíz de tu carpeta 'backend'
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Generar un nombre de archivo único usando el campo del formulario, un timestamp y la extensión original
    // Ejemplo: profilePicture-1678901234567.png
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage: storage }); // Inicializa Multer con la configuración de almacenamiento

// --- RUTAS DE AUTENTICACIÓN ---

// @route   POST api/auth/register
// @desc    Registrar nuevo usuario
// @access  Public
router.post("/register", authController.registerUser);

// @route   POST api/auth/login
// @desc    Autenticar usuario y obtener token
// @access  Public
router.post("/login", authController.loginUser);

// @route   PUT api/auth/change-password
// @desc    Cambiar la contraseña del usuario
// @access  Private (requiere token JWT)
router.put("/change-password", auth, authController.changePassword);

// @route   GET api/auth
// @desc    Obtener datos del usuario autenticado (con token)
// @access  Private (requiere token JWT)
router.get("/", auth, authController.getUser);

// --- RUTAS DE SUBIDA DE IMÁGENES DE PERFIL ---

// @route   PUT api/auth/profile-picture
// @desc    Subir y actualizar la foto de perfil
// @access  Private (requiere token JWT)
// 'profilePicture' es el nombre del campo 'name' en el input type="file" del formulario
router.put(
  "/profile-picture",
  auth,
  upload.single("profilePicture"),
  authController.uploadProfilePicture
);

// @route   PUT api/auth/banner
// @desc    Subir y actualizar el banner del perfil
// @access  Private (requiere token JWT)
// 'banner' es el nombre del campo 'name' en el input type="file" del formulario
router.put(
  "/banner",
  auth,
  upload.single("banner"),
  authController.uploadBanner
);

module.exports = router;
