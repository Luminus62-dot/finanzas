// backend/controllers/savingGoalController.js
const SavingGoal = require("../models/SavingGoal");

// @route   GET api/savinggoals
// @desc    Obtener todas las metas de ahorro del usuario
// @access  Private
exports.getSavingGoals = async (req, res) => {
  try {
    const goals = await SavingGoal.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(goals);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

// @route   POST api/savinggoals
// @desc    Crear una nueva meta de ahorro
// @access  Private
exports.createSavingGoal = async (req, res) => {
  const { name, targetAmount, dueDate, description } = req.body;

  try {
    // Validar si el nombre de la meta ya existe para el usuario
    const existingGoal = await SavingGoal.findOne({ user: req.user.id, name });
    if (existingGoal) {
      return res.status(400).json({
        msg: "Ya existe una meta de ahorro con este nombre para este usuario",
      });
    }

    const newGoal = new SavingGoal({
      user: req.user.id,
      name,
      targetAmount: parseFloat(targetAmount),
      dueDate: dueDate || null, // Guardar null si no se proporciona fecha
      description,
    });

    const goal = await newGoal.save();
    res.status(201).json(goal); // 201 Created
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

// @route   PUT api/savinggoals/:id
// @desc    Actualizar una meta de ahorro por ID
// @access  Private
exports.updateSavingGoal = async (req, res) => {
  const {
    name,
    targetAmount,
    currentAmount,
    dueDate,
    description,
    isCompleted,
  } = req.body;

  try {
    let goal = await SavingGoal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ msg: "Meta de ahorro no encontrada" });
    }

    // Verificar que la meta pertenece al usuario autenticado
    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    // Validar si el nuevo nombre de la meta ya existe para el usuario (excluyendo la meta actual)
    if (name && name !== goal.name) {
      const existingGoal = await SavingGoal.findOne({
        user: req.user.id,
        name,
      });
      if (existingGoal && existingGoal._id.toString() !== req.params.id) {
        return res.status(400).json({
          msg: "Ya existe otra meta con este nombre para este usuario",
        });
      }
    }

    // Actualizar campos
    goal.name = name || goal.name;
    goal.targetAmount =
      targetAmount !== undefined ? parseFloat(targetAmount) : goal.targetAmount;
    goal.currentAmount =
      currentAmount !== undefined
        ? parseFloat(currentAmount)
        : goal.currentAmount;
    goal.dueDate = dueDate !== undefined ? dueDate : goal.dueDate;
    goal.description =
      description !== undefined ? description : goal.description;
    goal.isCompleted =
      isCompleted !== undefined ? isCompleted : goal.isCompleted;

    // Si el currentAmount >= targetAmount, la meta se considera completada
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    } else {
      goal.isCompleted = false; // Si baja el monto, puede desmarcarse como completada
    }

    await goal.save();
    res.json(goal);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

// @route   DELETE api/savinggoals/:id
// @desc    Eliminar una meta de ahorro por ID
// @access  Private
exports.deleteSavingGoal = async (req, res) => {
  try {
    let goal = await SavingGoal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ msg: "Meta de ahorro no encontrada" });
    }

    // Verificar que la meta pertenece al usuario autenticado
    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    await SavingGoal.deleteOne({ _id: req.params.id });
    res.json({ msg: "Meta de ahorro eliminada" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};
