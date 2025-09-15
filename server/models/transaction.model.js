import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  paymentType: {
    type: String,
    enum: ["cash", "card", "bkash"],
    required: true,
  },
  category: {
    type: String,
    enum: ["entertainment", "productivity", "utilities", "education"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  provider: {
    type: String,
    default: "Unknown",
  },
  endDate: {
    type: Date,
    required: true,
  },
  alertEnabled: { type: Boolean, default: false },
  alertSentForDateMinus1: { type: Boolean, default: false },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
