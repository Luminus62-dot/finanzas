// backend/controllers/transactionController.js
const Transaction = require("../models/Transaction");
const Account = require("../models/Account"); // Necesitamos el modelo de cuenta para actualizar saldos

// @route   GET api/transactions
// @desc    Obtener todas las transacciones del usuario actual
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .populate("account", "name currency") // Obtiene nombre y moneda de la cuenta
      .populate("toAccount", "name currency") // Obtiene nombre y moneda de la cuenta destino
      .sort({ date: -1, createdAt: -1 }); // Ordenar por fecha y luego por creación

    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

// @route   POST api/transactions
// @desc    Crear una nueva transacción
// @access  Private
exports.createTransaction = async (req, res) => {
  const { account, type, category, description, amount, date, toAccount } =
    req.body;

  try {
    // 1. Validar que la cuenta existe y pertenece al usuario
    const fromAccount = await Account.findOne({
      _id: account,
      user: req.user.id,
    });
    if (!fromAccount) {
      return res
        .status(404)
        .json({
          msg: "Cuenta de origen no encontrada o no pertenece al usuario",
        });
    }

    // 2. Crear la nueva transacción
    const newTransaction = new Transaction({
      user: req.user.id,
      account,
      type,
      category,
      description,
      amount: parseFloat(amount), // Asegurarse de que el monto es un número
      date: date || Date.now(), // Usar la fecha proporcionada o la actual
    });

    // 3. Actualizar el balance de la cuenta de origen
    if (type === "Ingreso") {
      fromAccount.balance += newTransaction.amount;
    } else if (type === "Gasto") {
      fromAccount.balance -= newTransaction.amount;
    } else if (type === "Transferencia") {
      if (!toAccount) {
        return res
          .status(400)
          .json({
            msg: "Se requiere una cuenta de destino para transferencias",
          });
      }
      const destinationAccount = await Account.findOne({
        _id: toAccount,
        user: req.user.id,
      });
      if (!destinationAccount) {
        return res
          .status(404)
          .json({
            msg: "Cuenta de destino no encontrada o no pertenece al usuario",
          });
      }
      if (fromAccount._id.toString() === destinationAccount._id.toString()) {
        return res
          .status(400)
          .json({
            msg: "La cuenta de origen y destino no pueden ser la misma para una transferencia",
          });
      }

      fromAccount.balance -= newTransaction.amount;
      destinationAccount.balance += newTransaction.amount;
      await destinationAccount.save(); // Guardar el cambio en la cuenta destino
      newTransaction.toAccount = toAccount; // Asignar la cuenta de destino a la transacción
    } else {
      return res.status(400).json({ msg: "Tipo de transacción inválido" });
    }

    await fromAccount.save(); // Guardar el cambio en la cuenta de origen
    const transaction = await newTransaction.save(); // Guardar la transacción

    res.status(201).json(transaction); // 201 Created
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

// @route   PUT api/transactions/:id
// @desc    Actualizar una transacción por ID
// @access  Private
exports.updateTransaction = async (req, res) => {
  const { account, type, category, description, amount, date, toAccount } =
    req.body;
  const transactionId = req.params.id;

  try {
    let transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ msg: "Transacción no encontrada" });
    }

    // Verificar que la transacción pertenece al usuario autenticado
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    // --- Lógica de reversión y aplicación de impacto de saldo ---
    // Revertir el impacto de la transacción antigua en su cuenta original
    const oldFromAccount = await Account.findById(transaction.account);
    if (!oldFromAccount) {
      console.error(
        "Cuenta de origen antigua no encontrada para transacción:",
        transaction._id
      );
      return res
        .status(500)
        .json({
          msg: "Error interno: Cuenta de origen antigua no encontrada.",
        });
    }

    if (transaction.type === "Ingreso") {
      oldFromAccount.balance -= transaction.amount;
    } else if (transaction.type === "Gasto") {
      oldFromAccount.balance += transaction.amount;
    } else if (transaction.type === "Transferencia") {
      const oldToAccount = await Account.findById(transaction.toAccount);
      if (!oldToAccount) {
        console.error(
          "Cuenta de destino antigua no encontrada para transacción:",
          transaction._id
        );
        return res
          .status(500)
          .json({
            msg: "Error interno: Cuenta de destino antigua no encontrada.",
          });
      }
      oldFromAccount.balance += transaction.amount; // Devuelve el dinero a la cuenta de origen
      oldToAccount.balance -= transaction.amount; // Quita el dinero de la cuenta de destino
      await oldToAccount.save();
    }
    await oldFromAccount.save();

    // Actualizar campos de la transacción
    transaction.account = account || transaction.account;
    transaction.type = type || transaction.type;
    transaction.category = category || transaction.category;
    transaction.description =
      description !== undefined ? description : transaction.description; // Permite vaciar la descripción
    transaction.amount =
      amount !== undefined ? parseFloat(amount) : transaction.amount;
    transaction.date = date || transaction.date;

    // Aplicar el nuevo impacto en las cuentas (nueva o misma)
    const newFromAccount = await Account.findById(transaction.account);
    if (!newFromAccount) {
      console.error(
        "Nueva cuenta de origen no encontrada durante actualización de transacción:",
        transaction.account
      );
      return res
        .status(404)
        .json({ msg: "Nueva cuenta de origen no encontrada." });
    }

    if (transaction.type === "Ingreso") {
      newFromAccount.balance += transaction.amount;
    } else if (transaction.type === "Gasto") {
      newFromAccount.balance -= transaction.amount;
    } else if (transaction.type === "Transferencia") {
      if (!toAccount)
        return res
          .status(400)
          .json({ msg: "Se requiere cuenta destino para transferencia" });
      const newToAccount = await Account.findOne({
        _id: toAccount,
        user: req.user.id,
      }); // Buscar en las del usuario
      if (!newToAccount)
        return res
          .status(404)
          .json({
            msg: "Nueva cuenta de destino no encontrada o no pertenece al usuario",
          });
      if (newFromAccount._id.toString() === newToAccount._id.toString()) {
        return res
          .status(400)
          .json({
            msg: "La cuenta de origen y destino no pueden ser la misma para una transferencia",
          });
      }

      newFromAccount.balance -= transaction.amount;
      newToAccount.balance += transaction.amount;
      transaction.toAccount = toAccount; // Actualizar campo toAccount en la transacción
      await newToAccount.save();
    } else {
      return res
        .status(400)
        .json({
          msg: "Tipo de transacción inválido después de la actualización",
        });
    }

    await newFromAccount.save();
    await transaction.save();
    res.json(transaction);
  } catch (err) {
    console.error("Error al actualizar transacción:", err.message);
    res.status(500).send("Error del servidor");
  }
};

// @route   DELETE api/transactions/:id
// @desc    Eliminar una transacción por ID
// @access  Private
exports.deleteTransaction = async (req, res) => {
  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ msg: "Transacción no encontrada" });
    }

    // Verificar que la transacción pertenece al usuario autenticado
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    // Revertir el impacto de la transacción en el balance de la cuenta
    const account = await Account.findById(transaction.account);
    if (!account) {
      console.error(
        "Cuenta asociada a la transacción eliminada no encontrada."
      );
      // Aunque no se encuentre, si la transacción existe y pertenece al usuario, la eliminamos.
      // Se podría considerar un error aquí si el saldo es crítico.
    } else {
      if (transaction.type === "Ingreso") {
        account.balance -= transaction.amount;
      } else if (transaction.type === "Gasto") {
        account.balance += transaction.amount;
      } else if (transaction.type === "Transferencia") {
        const toAccount = await Account.findById(transaction.toAccount);
        if (toAccount) {
          // Solo si la cuenta destino aún existe
          account.balance += transaction.amount; // Devuelve el dinero a la cuenta de origen
          toAccount.balance -= transaction.amount; // Quita el dinero de la cuenta de destino
          await toAccount.save();
        }
      }
      await account.save(); // Guarda el balance actualizado
    }

    await Transaction.deleteOne({ _id: req.params.id });
    res.json({ msg: "Transacción eliminada y balance de cuenta actualizado" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};
