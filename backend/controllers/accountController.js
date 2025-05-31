// backend/controllers/accountController.js
const Account = require("../models/Account");

// @route   GET api/accounts
// @desc    Obtener todas las cuentas del usuario actual
// @access  Private
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(accounts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

// @route   POST api/accounts
// @desc    Crear una nueva cuenta
// @access  Private
exports.createAccount = async (req, res) => {
  const { name, type, balance, currency } = req.body;

  try {
    // Validar si el nombre de la cuenta ya existe para el usuario
    const existingAccount = await Account.findOne({
      user: req.user.id,
      name: name,
    });
    if (existingAccount) {
      return res
        .status(400)
        .json({
          msg: "Ya existe una cuenta con este nombre para este usuario",
        });
    }

    const newAccount = new Account({
      user: req.user.id,
      name,
      type,
      balance,
      currency,
    });

    const account = await newAccount.save();
    res.status(201).json(account); // 201 Created
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

// @route   PUT api/accounts/:id
// @desc    Actualizar una cuenta por ID
// @access  Private
exports.updateAccount = async (req, res) => {
  const { name, type, balance, currency } = req.body;

  try {
    let account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({ msg: "Cuenta no encontrada" });
    }

    // Verificar que la cuenta pertenece al usuario autenticado
    if (account.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    // Opcional: Validar si el nuevo nombre de la cuenta ya existe para el usuario, excluyendo la cuenta actual
    if (name && name !== account.name) {
      const existingAccount = await Account.findOne({
        user: req.user.id,
        name: name,
      });
      if (existingAccount && existingAccount._id.toString() !== req.params.id) {
        return res
          .status(400)
          .json({
            msg: "Ya existe otra cuenta con este nombre para este usuario",
          });
      }
    }

    // Actualizar campos
    account.name = name || account.name;
    account.type = type || account.type;
    account.balance = balance !== undefined ? balance : account.balance; // Permite balance 0
    account.currency = currency || account.currency;

    await account.save();
    res.json(account);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

// @route   DELETE api/accounts/:id
// @desc    Eliminar una cuenta por ID
// @access  Private
exports.deleteAccount = async (req, res) => {
  try {
    let account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({ msg: "Cuenta no encontrada" });
    }

    // Verificar que la cuenta pertenece al usuario autenticado
    if (account.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    await Account.deleteOne({ _id: req.params.id });
    res.json({ msg: "Cuenta eliminada" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};
