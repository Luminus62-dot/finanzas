// backend/routes/transaction.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // Importa el middleware de autenticación
const transactionController = require("../controllers/transactionController"); // Importa el controlador

// @route   GET api/transactions
// @desc    Obtener todas las transacciones del usuario
// @access  Private
router.get("/", auth, transactionController.getTransactions);

// @route   POST api/transactions
// @desc    Crear una nueva transacción
// @access  Private
router.post("/", auth, transactionController.createTransaction);

// @route   PUT api/transactions/:id
// @desc    Actualizar una transacción
// @access  Private
router.put("/:id", auth, transactionController.updateTransaction);

// @route   DELETE api/transactions/:id
// @desc    Eliminar una transacción
// @access  Private
router.delete("/:id", auth, transactionController.deleteTransaction);

// @route   GET api/transactions/summary
// @desc    Obtener un resumen de transacciones para reportes
// @access  Private
router.get("/summary", auth, transactionController.getTransactionsSummary);

module.exports = router;
