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
  startDate: {
    type: Date,
    required: true,
  },
  nextBillingDate: {
    type: Date,
    required: true,
  },
  currency: {
    type: String,
    default: "USD",
    enum: ["USD", "EUR", "GBP", "INR", "BDT", "CAD", "AUD", "JPY", "CHF", "CNY"],
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
  // Advanced reminders can fire more than once per cycle (e.g. 7 days and 1 day
  // before). This records which lead-day thresholds have already been sent for
  // the current billing cycle; reset when the cycle rolls over.
  remindersSentDays: {
    type: [Number],
    default: [],
  },
  // Google Calendar event id when the owner has calendar sync enabled, so we
  // can update/delete the corresponding event.
  googleEventId: {
    type: String,
  },
}, { timestamps: true });

// Most queries fetch a user's subscriptions; the billing cron scans by due date.
subscriptionSchema.index({ userId: 1, createdAt: -1 });
subscriptionSchema.index({ nextBillingDate: 1 });

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
