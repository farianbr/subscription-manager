import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";
import Transaction from "../models/transaction.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendMail } from "../utils/mailer.js";
import { sendVerificationEmail } from "../utils/emails.js";
import logger from "../utils/logger.js";
import {
  requireString,
  requireEmail,
  requirePassword,
  requireEnum,
  GENDERS,
} from "../utils/validators.js";

// Create a verification token (raw for the link, hashed for storage) and email it.
async function issueEmailVerification(user) {
  const token = crypto.randomBytes(32).toString("hex");
  user.emailVerificationToken = crypto.createHash("sha256").update(token).digest("hex");
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  await user.save();

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  await sendVerificationEmail({
    to: user.email,
    name: user.name,
    verifyUrl: `${clientUrl}/verify-email/${token}`,
  });
}

const userResolver = {
  Query: {
    authUser: async (_, __, context) => {
      try {
        const user = await context.getUser();
        return user;
      } catch (err) {
        logger.error("Error in authUser: ", err);
        throw new Error("Internal server error");
      }
    },
    user: async (_, { userId }, context) => {
      try {
        const authedUser = await context.getUser();
        if (!authedUser) throw new Error("Unauthorized");

        // Users may only fetch their own record
        if (authedUser._id.toString() !== userId) {
          throw new Error("Unauthorized");
        }

        return await User.findById(userId);
      } catch (err) {
        logger.error("Error in user query:", err);
        throw new Error(err.message || "Error getting user");
      }
    },
  },

  Mutation: {
    signUp: async (_, { input }, context) => {
      try {
        const email = requireEmail(input.email);
        const name = requireString(input.name, "Name", { max: 100 });
        const password = requirePassword(input.password);
        const gender = requireEnum(input.gender, GENDERS, "Gender");

        // check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) throw new Error("Email already in use");

        const hashedPassword = await bcrypt.hash(password, 10);

        // create user (no profilePicture - will use name initials by default)
        const newUser = new User({
          email,
          name,
          password: hashedPassword,
          gender,
          profilePicture: "", // Empty - frontend will show initials
        });

        await newUser.save();

        // Send an email verification link (best-effort; never blocks signup).
        try {
          await issueEmailVerification(newUser);
        } catch (mailErr) {
          logger.error("Failed to send verification email:", mailErr.message);
        }

        // Automatically log in the user after signup
        await context.login(newUser);

        return newUser;
      } catch (err) {
        logger.error("Error in signUp: ", err);
        throw new Error(err.message || "Internal server error");
      }
    },
    login: async (_, { input }, context) => {
      try {
        const email = requireEmail(input.email);
        const password = requireString(input.password, "Password", { max: 200 });

        const { user, info } = await context.authenticate("graphql-local", {
          email,
          password,
        });

        if (!user) throw new Error(info?.message || "Invalid credentials");

        await context.login(user);
        return user;
      } catch (err) {
        logger.error("Error in login:", err);
        throw new Error(err.message || "Internal server error");
      }
    },

    logout: async (_, __, context) => {
      try {
        await context.logout();
        context.req.session.destroy((err) => {
          if (err) throw err;
        });
        context.res.clearCookie("connect.sid");

        return { message: "Logged out successfully" };
      } catch (err) {
        logger.error("Error in logout:", err);
        throw new Error(err.message || "Internal server error");
      }
    },

    updateProfile: async (_, { input }, context) => {
      try {
        const user = await context.getUser();
        if (!user) throw new Error("Unauthorized");

        const { name, email, currency } = input;
        
        if (email && email !== user.email) {
          const existingUser = await User.findOne({ email });
          if (existingUser) throw new Error("Email already in use");
        }

        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { 
            ...(name && { name }),
            ...(email && { email }),
            ...(currency && { currency })
          },
          { new: true }
        );

        return updatedUser;
      } catch (err) {
        logger.error("Error in updateProfile:", err);
        throw new Error(err.message || "Internal server error");
      }
    },

    updatePassword: async (_, { input }, context) => {
      try {
        const user = await context.getUser();
        if (!user) throw new Error("Unauthorized");

        const { currentPassword, newPassword } = input;
        
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) throw new Error("Current password is incorrect");

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { password: hashedPassword },
          { new: true }
        );

        return updatedUser;
      } catch (err) {
        logger.error("Error in updatePassword:", err);
        throw new Error(err.message || "Internal server error");
      }
    },

    updateProfilePicture: async (_, { profilePicture }, context) => {
      try {
        const user = await context.getUser();
        if (!user) throw new Error("Unauthorized");

        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { profilePicture },
          { new: true }
        );

        return updatedUser;
      } catch (err) {
        logger.error("Error in updateProfilePicture:", err);
        throw new Error(err.message || "Internal server error");
      }
    },

    addPaymentMethod: async (_, { input }, context) => {
      try {
        const user = await context.getUser();
        if (!user) throw new Error("Unauthorized");

        const { name, type, last4, isDefault } = input;
        
        // If this is the first payment method, make it default
        const shouldBeDefault = isDefault || user.paymentMethods.length === 0;
        
        const newPaymentMethod = {
          id: crypto.randomBytes(16).toString("hex"),
          name,
          type,
          last4,
          isDefault: shouldBeDefault,
        };

        // If this is set as default, unset other defaults
        if (shouldBeDefault) {
          user.paymentMethods.forEach(pm => pm.isDefault = false);
        }

        user.paymentMethods.push(newPaymentMethod);
        await user.save();

        return user;
      } catch (err) {
        logger.error("Error in addPaymentMethod:", err);
        throw new Error(err.message || "Internal server error");
      }
    },

    removePaymentMethod: async (_, { paymentMethodId }, context) => {
      try {
        const user = await context.getUser();
        if (!user) throw new Error("Unauthorized");

        user.paymentMethods = user.paymentMethods.filter(
          pm => pm.id !== paymentMethodId
        );
        
        await user.save();
        return user;
      } catch (err) {
        logger.error("Error in removePaymentMethod:", err);
        throw new Error(err.message || "Internal server error");
      }
    },

    setDefaultPaymentMethod: async (_, { paymentMethodId }, context) => {
      try {
        const user = await context.getUser();
        if (!user) throw new Error("Unauthorized");

        user.paymentMethods.forEach(pm => {
          pm.isDefault = pm.id === paymentMethodId;
        });
        
        await user.save();
        return user;
      } catch (err) {
        logger.error("Error in setDefaultPaymentMethod:", err);
        throw new Error(err.message || "Internal server error");
      }
    },

    forgotPassword: async (_, { email }) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          // Don't reveal whether a user exists
          return { message: "If that email is registered, a reset link has been sent." };
        }

        // Generate a secure random token
        const token = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        // Store hashed token with 1-hour expiry
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        // Build reset URL
        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const resetUrl = `${clientUrl}/reset-password/${token}`;

        await sendMail({
          to: user.email,
          subject: "Password Reset Request",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1e40af;">Reset Your Password</h2>
              <p>Hi ${user.name},</p>
              <p>You requested a password reset. Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
              <a href="${resetUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Reset Password</a>
              <p>If you didn't request this, you can safely ignore this email.</p>
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"/>
              <p style="color:#64748b;font-size:12px;">Subscription Manager &mdash; this link expires in 1 hour.</p>
            </div>
          `,
          text: `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
        });

        return { message: "If that email is registered, a reset link has been sent." };
      } catch (err) {
        logger.error("Error in forgotPassword:", err);
        throw new Error(err.message || "Internal server error");
      }
    },

    resetPassword: async (_, { token, newPassword }) => {
      try {
        requirePassword(newPassword);

        // Hash the incoming token to compare with the stored hash
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
          resetPasswordToken: hashedToken,
          resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) throw new Error("Reset token is invalid or has expired");

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return { message: "Password has been reset successfully. You can now log in." };
      } catch (err) {
        logger.error("Error in resetPassword:", err);
        throw new Error(err.message || "Internal server error");
      }
    },

    verifyEmail: async (_, { token }) => {
      try {
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        // Idempotent: the token stays valid until it expires, so a repeated click
        // (React's double-effect, a link opened on another device, or an email
        // scanner) re-verifies harmlessly instead of failing on the second hit.
        const user = await User.findOne({
          emailVerificationToken: hashedToken,
          emailVerificationExpires: { $gt: new Date() },
        });

        if (!user) throw new Error("Verification link is invalid or has expired");

        if (!user.emailVerified) {
          user.emailVerified = true;
          await user.save();
        }

        return { message: "Email verified successfully." };
      } catch (err) {
        logger.error("Error in verifyEmail:", err);
        throw new Error(err.message || "Internal server error");
      }
    },

    resendVerificationEmail: async (_, __, context) => {
      try {
        const user = await context.getUser();
        if (!user) throw new Error("Unauthorized");
        if (user.emailVerified) {
          return { message: "Your email is already verified." };
        }

        await issueEmailVerification(user);
        return { message: "Verification email sent." };
      } catch (err) {
        logger.error("Error in resendVerificationEmail:", err);
        throw new Error(err.message || "Internal server error");
      }
    },

    updateNotificationPreferences: async (_, { input }, context) => {
      try {
        const user = await context.getUser();
        if (!user) throw new Error("Unauthorized");

        const prefs = user.notificationPreferences || {};
        if (input.emailReminders !== undefined) prefs.emailReminders = Boolean(input.emailReminders);
        if (input.productUpdates !== undefined) prefs.productUpdates = Boolean(input.productUpdates);
        if (input.reminderDaysBefore !== undefined) {
          const days = Number(input.reminderDaysBefore);
          if (!Number.isInteger(days) || days < 0 || days > 30) {
            throw new Error("Reminder days must be between 0 and 30");
          }
          prefs.reminderDaysBefore = days;
        }

        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { notificationPreferences: prefs },
          { new: true }
        );
        return updatedUser;
      } catch (err) {
        logger.error("Error in updateNotificationPreferences:", err);
        throw new Error(err.message || "Internal server error");
      }
    },

    deleteAccount: async (_, { password }, context) => {
      try {
        const user = await context.getUser();
        if (!user) throw new Error("Unauthorized");

        const isValid = await bcrypt.compare(password || "", user.password);
        if (!isValid) throw new Error("Password is incorrect");

        // Remove all data owned by the user, then the account itself.
        await Promise.all([
          Subscription.deleteMany({ userId: user._id }),
          Transaction.deleteMany({ userId: user._id }),
          Notification.deleteMany({ userId: user._id }),
        ]);
        await User.findByIdAndDelete(user._id);

        // End the session.
        await context.logout();
        context.req.session.destroy(() => {});
        context.res.clearCookie("connect.sid");

        return { message: "Your account has been deleted." };
      } catch (err) {
        logger.error("Error in deleteAccount:", err);
        throw new Error(err.message || "Internal server error");
      }
    },
  },
};

export default userResolver;
