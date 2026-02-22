import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendMail } from "../utils/mailer.js";

const userResolver = {
  Query: {
    authUser: async (_, __, context) => {
      try {
        const user = await context.getUser();
        return user;
      } catch (err) {
        console.error("Error in authUser: ", err);
        throw new Error("Internal server error");
      }
    },
    user: async (_, { userId }) => {
      try {
        const user = await User.findById(userId);
        return user;
      } catch (err) {
        console.error("Error in user query:", err);
        throw new Error(err.message || "Error getting user");
      }
    },
  },

  Mutation: {
    signUp: async (_, { input }, context) => {
      try {
        const { email, name, password, gender } = input;
        if (!email || !password || !name || !gender) throw new Error("All fields are required");

      
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

        // Automatically log in the user after signup
        await context.login(newUser);

        return newUser;
      } catch (err) {
        console.error("Error in signUp: ", err);
        throw new Error(err.message || "Internal server error");
      }
    },
    login: async (_, { input }, context) => {
      try {
        const { email, password } = input;
        if (!email || !password) throw new Error("All fields are required");

        const { user, info } = await context.authenticate("graphql-local", {
          email,
          password,
        });

        if (!user) throw new Error(info?.message || "Invalid credentials");

        await context.login(user);
        return user;
      } catch (err) {
        console.error("Error in login:", err);
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
        console.error("Error in logout:", err);
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
        console.error("Error in updateProfile:", err);
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
        console.error("Error in updatePassword:", err);
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
        console.error("Error in updateProfilePicture:", err);
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
        console.error("Error in addPaymentMethod:", err);
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
        console.error("Error in removePaymentMethod:", err);
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
        console.error("Error in setDefaultPaymentMethod:", err);
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
        console.error("Error in forgotPassword:", err);
        throw new Error(err.message || "Internal server error");
      }
    },

    resetPassword: async (_, { token, newPassword }) => {
      try {
        if (!newPassword || newPassword.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }

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
        console.error("Error in resetPassword:", err);
        throw new Error(err.message || "Internal server error");
      }
    },
  },
};

export default userResolver;
