import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
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
  costInDollar: {
    type: Number,
    required: true,
  },
  billingCycle: {
    type: String,
    enum: ["monthly", "yearly", "weekly"],
    default: "monthly",
  },
  startDate: {
    type: Date,
    required: true,
  },
  nextBillingDate: {
    type: Date,
    required: true,
  },
  paymentMethodId: {
    type: String,
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
