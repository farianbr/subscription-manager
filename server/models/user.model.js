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

// Password-reset lookups query by the hashed token.
userSchema.index({ resetPasswordToken: 1 });

const User = mongoose.model("User", userSchema);

export default User;
