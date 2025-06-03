// backend/controllers/transactionController.js
const Transaction = require("../models/Transaction");
const Account = require("../models/Account");
const mongoose = require("mongoose"); // <-- ¡Asegúrate de que mongoose esté importado aquí!

// @route   GET api/transactions
// @desc    Obtener todas las transacciones del usuario actual, con filtros y búsqueda
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    const { type, category, description, startDate, endDate } = req.query;

    let filter = { user: req.user.id };

    if (type) {
      filter.type = type;
    }
    if (category) {
      filter.category = new RegExp(category, "i");
    }
    if (description) {
      filter.description = new RegExp(description, "i");
    }
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        let start = new Date(startDate);
        start.setUTCHours(0, 0, 0, 0);
        filter.date.$gte = start;
      }
      if (endDate) {
        let end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const transactions = await Transaction.find(filter)
      .populate("account", "name currency")
      .populate("toAccount", "name currency")
      .sort({ date: -1, createdAt: -1 });

    res.json(transactions);
  } catch (err) {
    console.error("Error al obtener transacciones:", err.message);
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

    const newTransaction = new Transaction({
      user: req.user.id,
      account,
      type,
      category,
      description,
      amount: parseFloat(amount),
      date: date || Date.now(),
    });

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
      await destinationAccount.save();
      newTransaction.toAccount = toAccount;
    } else {
      return res.status(400).json({ msg: "Tipo de transacción inválido" });
    }

    await fromAccount.save();
    const transaction = await newTransaction.save();

    res.status(201).json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

exports.updateTransaction = async (req, res) => {
  const { account, type, category, description, amount, date, toAccount } =
    req.body;
  const transactionId = req.params.id;

  try {
    let transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ msg: "Transacción no encontrada" });
    }

    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }

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
      oldFromAccount.balance += transaction.amount;
      oldToAccount.balance -= transaction.amount;
      await oldToAccount.save();
    }
    await oldFromAccount.save();

    transaction.account = account || transaction.account;
    transaction.type = type || transaction.type;
    transaction.category = category || transaction.category;
    transaction.description =
      description !== undefined ? description : transaction.description;
    transaction.amount =
      amount !== undefined ? parseFloat(amount) : transaction.amount;
    transaction.date = date || transaction.date;

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
      });
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
      transaction.toAccount = toAccount;
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

exports.deleteTransaction = async (req, res) => {
  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ msg: "Transacción no encontrada" });
    }

    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    const account = await Account.findById(transaction.account);
    if (!account) {
      console.error(
        "Cuenta asociada a la transacción eliminada no encontrada."
      );
    } else {
      if (transaction.type === "Ingreso") {
        account.balance -= transaction.amount;
      } else if (transaction.type === "Gasto") {
        account.balance += transaction.amount;
      } else if (transaction.type === "Transferencia") {
        const toAccount = await Account.findById(transaction.toAccount);
        if (toAccount) {
          account.balance += transaction.amount;
          toAccount.balance -= transaction.amount;
          await toAccount.save();
        }
      }
      await account.save();
    }

    await Transaction.deleteOne({ _id: req.params.id });
    res.json({ msg: "Transacción eliminada y balance de cuenta actualizado" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

// @route   GET api/transactions/summary
// @desc    Obtener un resumen de gastos/ingresos por categoría para un período
// @access  Private
exports.getTransactionsSummary = async (req, res) => {
  const { startDate, endDate, type } = req.query;

  // Importante: Asegurar que las fechas representen el inicio y fin del día en UTC
  let startOfDay = new Date(startDate);
  startOfDay.setUTCHours(0, 0, 0, 0);

  let endOfDay = new Date(endDate);
  endOfDay.setUTCHours(23, 59, 59, 999);

  // Asegurarse de que el user ID sea un ObjectId para la comparación en el pipeline
  const userId = new mongoose.Types.ObjectId(req.user.id); // <-- ¡CAMBIO CRÍTICO AQUÍ!

  let matchConditions = {
    user: userId, // ¡USAR EL OBJECTID CONVERTIDO!
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  };

  if (type) {
    matchConditions.type = type;
  } else {
    matchConditions.type = { $in: ["Ingreso", "Gasto"] };
  }

  // --- Debugging en la terminal del Backend (Render.com) ---
  console.log("\n--- Backend Debugging Reporte Sumario ---");
  console.log("Usuario que realiza la petición (ID del Token):", req.user.id);
  console.log(
    "Usuario que se usará en el match (ObjectId):",
    userId.toString()
  );
  console.log(
    "Rango de Fechas Solicitado por Frontend (ISO):",
    startDate,
    "a",
    endDate
  );
  console.log("Rango de Fechas para Match en DB (Objetos Date UTC):");
  console.log("  $gte (Inicio del día):", startOfDay.toISOString());
  console.log("  $lte (Fin del día):", endOfDay.toISOString());
  console.log("Condiciones de Match Finales enviadas a MongoDB:");
  console.log(
    JSON.stringify(
      {
        user: userId.toString(),
        date: {
          $gte: startOfDay.toISOString(),
          $lte: endOfDay.toISOString(),
        },
        type: matchConditions.type,
      },
      null,
      2
    )
  );
  console.log("-------------------------------------------\n");

  try {
    const summary = await Transaction.aggregate([
      {
        $match: matchConditions,
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $sort: { totalAmount: -1 },
      },
    ]);

    const totalByType = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
          type: { $in: ["Ingreso", "Gasto"] },
        },
      },
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const incomeTotal =
      totalByType.find((item) => item._id === "Ingreso")?.totalAmount || 0;
    const expenseTotal =
      totalByType.find((item) => item._id === "Gasto")?.totalAmount || 0;

    res.json({
      categorySummary: summary,
      incomeTotal: incomeTotal,
      expenseTotal: expenseTotal,
      netFlow: incomeTotal - expenseTotal,
    });
  } catch (err) {
    console.error("Error en la agregación de resumen:", err.message);
    res.status(500).send("Error del servidor");
  }
};
