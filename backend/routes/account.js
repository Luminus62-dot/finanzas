// backend/routes/account.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // Importa el middleware de autenticación
const accountController = require("../controllers/accountController"); // Importa el controlador de cuentas

// @route   GET api/accounts
// @desc    Obtener todas las cuentas del usuario
// @access  Private
router.get("/", auth, accountController.getAccounts); // <-- Asegúrate de que accountController.getAccounts sea una función

// @route   POST api/accounts
// @desc    Crear una nueva cuenta
// @access  Private
router.post("/", auth, accountController.createAccount); // <-- Y esta

// @route   PUT api/accounts/:id
// @desc    Actualizar una cuenta
// @access  Private
router.put("/:id", auth, accountController.updateAccount); // <-- Y esta

// @route   DELETE api/accounts/:id
// @desc    Eliminar una cuenta
// @access  Private
router.delete("/:id", auth, accountController.deleteAccount); // <-- Y esta

module.exports = router;
