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
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationTokenExpires: Date,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
