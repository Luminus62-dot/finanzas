// backend/controllers/subscriptionController.js
const Subscription = require("../models/Subscription");
const Transaction = require("../models/Transaction");
const Account = require("../models/Account");

// Obtener todas las suscripciones del usuario
exports.getSubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.find({ user: req.user.id }).sort({ nextBillingDate: 1 });
    res.json(subs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

// Crear nueva suscripción
exports.createSubscription = async (req, res) => {
  const { name, amount, nextBillingDate, frequency, notes } = req.body;

  try {
    const sub = new Subscription({
      user: req.user.id,
      name,
      amount: parseFloat(amount),
      nextBillingDate,
      frequency,
      notes,
    });

    const saved = await sub.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

// Actualizar suscripción
exports.updateSubscription = async (req, res) => {
  const { name, amount, nextBillingDate, frequency, notes } = req.body;

  try {
    let sub = await Subscription.findById(req.params.id);
    if (!sub) {
      return res.status(404).json({ msg: "Suscripción no encontrada" });
    }

    if (sub.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    sub.name = name || sub.name;
    sub.amount = amount !== undefined ? parseFloat(amount) : sub.amount;
    sub.nextBillingDate = nextBillingDate || sub.nextBillingDate;
    sub.frequency = frequency || sub.frequency;
    sub.notes = notes !== undefined ? notes : sub.notes;

    await sub.save();
    res.json(sub);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

// Eliminar suscripción
exports.deleteSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) {
      return res.status(404).json({ msg: "Suscripción no encontrada" });
    }
    if (sub.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }
    await Subscription.deleteOne({ _id: req.params.id });
    res.json({ msg: "Suscripción eliminada" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

// Registrar el cobro de una suscripción y crear una transacción
exports.chargeSubscription = async (req, res) => {
  const { accountId, date } = req.body;
  try {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) {
      return res.status(404).json({ msg: "Suscripción no encontrada" });
    }
    if (sub.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    const account = await Account.findOne({ _id: accountId, user: req.user.id });
    if (!account) {
      return res
        .status(404)
        .json({ msg: "Cuenta no encontrada o no pertenece al usuario" });
    }

    const transaction = new Transaction({
      user: req.user.id,
      account: accountId,
      type: "Gasto",
      category: "Suscripción",
      description: sub.name,
      amount: sub.amount,
      date: date || Date.now(),
      subscription: sub._id,
    });

    account.balance -= sub.amount;
    await account.save();
    await transaction.save();

    const nextDate = new Date(sub.nextBillingDate);
    if (sub.frequency === "Anual") {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    } else {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
    sub.nextBillingDate = nextDate;
    await sub.save();

    res.status(201).json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};
