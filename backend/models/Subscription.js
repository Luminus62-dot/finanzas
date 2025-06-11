// backend/models/Subscription.js
const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    nextBillingDate: { type: Date, required: true },
    frequency: { type: String, default: "Mensual" },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", SubscriptionSchema);
