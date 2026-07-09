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
      // Premium "advanced reminders": fire a reminder at each of these lead
      // times (days before renewal). Empty = fall back to reminderDaysBefore.
      reminderLeadDays: {
        type: [Number],
        default: [],
      },
      productUpdates: { type: Boolean, default: false },
    },
    plan: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
    },
    // Opaque token for the private iCal calendar feed (Premium). Generated on
    // demand; rotating it invalidates any calendar subscribed to the old URL.
    calendarToken: {
      type: String,
    },
    // Google Calendar sync (Premium). refreshToken is encrypted at rest
    // (utils/crypto.js) and never exposed through the API.
    googleCalendar: {
      connected: { type: Boolean, default: false },
      refreshToken: { type: String },
      calendarId: { type: String, default: "primary" },
      email: { type: String },
      connectedAt: { type: Date },
    },
    // Cached AI insights (Premium). Regenerated only when `fingerprint` (a hash
    // of the user's subscriptions/transactions/currency) changes, so the card
    // auto-loads, survives reloads, and refreshes when the data does.
    aiInsightsCache: {
      fingerprint: { type: String },
      generatedAt: { type: Date },
      summary: { type: String },
      insights: [
        {
          _id: false,
          title: String,
          detail: String,
          severity: String,
        },
      ],
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
// The public calendar feed route looks a user up by this token.
userSchema.index({ calendarToken: 1 });

const User = mongoose.model("User", userSchema);

export default User;
