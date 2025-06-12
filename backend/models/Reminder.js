const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String },
    remindAt: { type: Date, required: true },
    notified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reminder', ReminderSchema);

