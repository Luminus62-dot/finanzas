const Reminder = require('../models/Reminder');

exports.getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user.id }).sort({ remindAt: 1 });
    res.json(reminders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

exports.createReminder = async (req, res) => {
  const { title, message, remindAt } = req.body;
  try {
    const reminder = new Reminder({
      user: req.user.id,
      title,
      message,
      remindAt,
    });
    await reminder.save();
    res.status(201).json(reminder);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

exports.updateReminder = async (req, res) => {
  const { title, message, remindAt, notified } = req.body;
  try {
    let reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ msg: 'Recordatorio no encontrado' });
    }
    if (reminder.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    reminder.title = title || reminder.title;
    reminder.message = message !== undefined ? message : reminder.message;
    reminder.remindAt = remindAt || reminder.remindAt;
    reminder.notified = notified !== undefined ? notified : reminder.notified;
    await reminder.save();
    res.json(reminder);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

exports.deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ msg: 'Recordatorio no encontrado' });
    }
    if (reminder.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }
    await Reminder.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Recordatorio eliminado' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

exports.getUpcoming = async (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const now = new Date();
  const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  try {
    const reminders = await Reminder.find({
      user: req.user.id,
      remindAt: { $gte: now, $lte: end },
    }).sort({ remindAt: 1 });
    res.json(reminders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

