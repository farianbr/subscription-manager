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
  paymentMethodId: {
    type: String,
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
  companyLogo: {
    type: String,
    default: "",
  },
  billingCycle: {
    type: String,
    enum: ["monthly", "yearly", "weekly"],
    default: "monthly",
  },
  renewalDate: {
    type: Date,
    required: true,
  },
  // Keep endDate for backward compatibility
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "canceled"],
    default: "active",
  },
  canceledAt: {
    type: Date,
  },
  alertEnabled: { type: Boolean, default: false },
  alertSentForDateMinus1: { type: Boolean, default: false },
}, { timestamps: true });

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
