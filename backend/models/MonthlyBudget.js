const mongoose = require("mongoose");

const MonthlyBudgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  month: {
    type: Number, // 0-11
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  notified: {
    type: Boolean,
    default: false, // whether email notification sent for this month on limit reached
  },
}, { timestamps: true });

MonthlyBudgetSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("MonthlyBudget", MonthlyBudgetSchema);
