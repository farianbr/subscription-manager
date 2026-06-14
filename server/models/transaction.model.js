import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
    required: false,
  },
  serviceName: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["entertainment", "productivity", "utilities", "education"],
    required: true,
  },
  // Normalized USD value, derived server-side — used for cross-currency aggregation.
  costInDollar: {
    type: Number,
    required: true,
  },
  // The amount and currency the user actually entered (source of truth).
  originalAmount: {
    type: Number,
  },
  originalCurrency: {
    type: String,
    enum: ["USD", "EUR", "GBP", "INR", "BDT", "CAD", "AUD", "JPY", "CHF", "CNY"],
  },
  billingCycle: {
    type: String,
    enum: ["monthly", "yearly", "weekly"],
    default: "monthly",
  },
  billingDate: {
    type: Date,
    required: true,
  },
  paymentMethodId: {
    type: String,
  },
  paymentMethodName: {
    type: String,
  },
}, { timestamps: true });

// History/analytics queries fetch a user's transactions ordered by billing date.
transactionSchema.index({ userId: 1, billingDate: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
