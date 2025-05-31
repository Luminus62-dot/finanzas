// backend/routes/savingGoal.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // Importa el middleware de autenticación
const savingGoalController = require("../controllers/savingGoalController"); // Importa el controlador

// @route   GET api/savinggoals
// @desc    Obtener todas las metas de ahorro del usuario
// @access  Private
router.get("/", auth, savingGoalController.getSavingGoals);

// @route   POST api/savinggoals
// @desc    Crear una nueva meta de ahorro
// @access  Private
router.post("/", auth, savingGoalController.createSavingGoal);

// @route   PUT api/savinggoals/:id
// @desc    Actualizar una meta de ahorro
// @access  Private
router.put("/:id", auth, savingGoalController.updateSavingGoal);

// @route   DELETE api/savinggoals/:id
// @desc    Eliminar una meta de ahorro
// @access  Private
router.delete("/:id", auth, savingGoalController.deleteSavingGoal);

module.exports = router;
