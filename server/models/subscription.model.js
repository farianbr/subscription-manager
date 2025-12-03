import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  description: {
    type: String,
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
  companyLogo: {
    type: String,
    default: "",
  },
  billingCycle: {
    type: String,
    enum: ["monthly", "yearly", "weekly"],
    default: "monthly",
  },
  nextBillingDate: {
    type: Date,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  paymentMethodId: {
    type: String,
  },
  status: {
    type: String,
    enum: ["active", "paused", "canceled"],
    default: "active",
  },
  canceledAt: {
    type: Date,
  },
  alertEnabled: { 
    type: Boolean, 
    default: false 
  },
  alertSentForCurrentCycle: { 
    type: Boolean, 
    default: false 
  },
}, { timestamps: true });

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
