// backend/controllers/categoryController.js
const Category = require("../models/Category");

// @route   GET api/categories
// @desc    Obtener todas las categorías del usuario
// @access  Private
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user.id }).sort({
      type: 1,
      name: 1,
    });
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

// @route   POST api/categories
// @desc    Crear una nueva categoría
// @access  Private
exports.createCategory = async (req, res) => {
  const { name, type } = req.body;

  try {
    // Validar si el nombre de la categoría ya existe para el usuario y tipo
    const existingCategory = await Category.findOne({
      user: req.user.id,
      name,
      type,
    });
    if (existingCategory) {
      return res
        .status(400)
        .json({
          msg: "Ya existe una categoría con este nombre y tipo para este usuario",
        });
    }

    const newCategory = new Category({
      user: req.user.id,
      name,
      type,
    });

    const category = await newCategory.save();
    res.status(201).json(category); // 201 Created
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

// @route   PUT api/categories/:id
// @desc    Actualizar una categoría por ID
// @access  Private
exports.updateCategory = async (req, res) => {
  const { name, type } = req.body;

  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ msg: "Categoría no encontrada" });
    }

    // Verificar que la categoría pertenece al usuario autenticado
    if (category.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    // Validar si el nuevo nombre de la categoría ya existe para el usuario y tipo (excluyendo la categoría actual)
    if (name && (name !== category.name || type !== category.type)) {
      const existingCategory = await Category.findOne({
        user: req.user.id,
        name,
        type,
      });
      if (
        existingCategory &&
        existingCategory._id.toString() !== req.params.id
      ) {
        return res
          .status(400)
          .json({
            msg: "Ya existe otra categoría con este nombre y tipo para este usuario",
          });
      }
    }

    category.name = name || category.name;
    category.type = type || category.type;

    await category.save();
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

// @route   DELETE api/categories/:id
// @desc    Eliminar una categoría por ID
// @access  Private
exports.deleteCategory = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ msg: "Categoría no encontrada" });
    }

    // Verificar que la categoría pertenece al usuario autenticado
    if (category.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    // Opcional: Podrías añadir lógica aquí para manejar transacciones que usen esta categoría
    // Por ahora, simplemente la eliminaremos. Podrías querer invalidar transacciones o asignarlas a una categoría "por defecto".

    await Category.deleteOne({ _id: req.params.id });
    res.json({ msg: "Categoría eliminada" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};
