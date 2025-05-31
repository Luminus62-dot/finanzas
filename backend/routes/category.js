// backend/routes/category.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // Importa el middleware de autenticación
const categoryController = require("../controllers/categoryController"); // Importa el controlador de categorías

// @route   GET api/categories
// @desc    Obtener todas las categorías del usuario
// @access  Private
router.get("/", auth, categoryController.getCategories);

// @route   POST api/categories
// @desc    Crear una nueva categoría
// @access  Private
router.post("/", auth, categoryController.createCategory);

// @route   PUT api/categories/:id
// @desc    Actualizar una categoría
// @access  Private
router.put("/:id", auth, categoryController.updateCategory);

// @route   DELETE api/categories/:id
// @desc    Eliminar una categoría
// @access  Private
router.delete("/:id", auth, categoryController.deleteCategory);

module.exports = router;
