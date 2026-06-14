import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "EUR", "GBP", "INR", "BDT", "CAD", "AUD", "JPY", "CHF", "CNY"],
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpires: {
      type: Date,
    },
    notificationPreferences: {
      emailReminders: { type: Boolean, default: true },
      reminderDaysBefore: { type: Number, default: 1, min: 0, max: 30 },
      productUpdates: { type: Boolean, default: false },
    },
    plan: {
      type: String,
      enum: ["free", "premium", "family"],
      default: "free",
    },
    // Stripe-ready billing metadata, populated when payments are wired up.
    billing: {
      stripeCustomerId: { type: String },
      stripeSubscriptionId: { type: String },
      status: {
        type: String,
        enum: ["none", "active", "canceled", "past_due"],
        default: "none",
      },
      currentPeriodEnd: { type: Date },
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    paymentMethods: [
      {
        id: String,
        name: String,
        type: { type: String, enum: ["card", "cash", "bkash", "other"] },
        last4: String,
        isDefault: Boolean,
      },
    ],
  },
  { timestamps: true }
);

// Password-reset and email-verification lookups query by the hashed token.
userSchema.index({ resetPasswordToken: 1 });
userSchema.index({ emailVerificationToken: 1 });

const User = mongoose.model("User", userSchema);

export default User;
