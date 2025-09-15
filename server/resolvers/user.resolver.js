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
    signUp: async (_, { input }) => {
      try {
        const { email, name, password, gender } = input;

      
        // check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) throw new Error("Email already in use");

        const hashedPassword = await bcrypt.hash(password, 10);

        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?email=${email}`;
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?email=${email}`;

        // generate token
        const token = crypto.randomBytes(32).toString("hex");

        // create user
        const newUser = new User({
          email,
          name,
          password: hashedPassword,
          gender,
          profilePicture: gender === "male" ? boyProfilePic : girlProfilePic,
          isVerified: false,
          verificationToken: token,
          verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24h
        });

        await newUser.save();

        // send verification mail
        const verifyUrl = `https://subscription-manager-qgi7.onrender.com/verify-email?token=${token}`;
        await sendMail({
          to: email,
          subject: "Verify your email",
          text: `Hi ${name}, please verify your email by clicking this link: ${verifyUrl}`,
          html: `<p>Hi ${name},</p>
             <p>Please verify your email by clicking the link below:</p>
             <a href="${verifyUrl}">Verify Email</a>`,
        });

        return {
          ...newUser.toObject(),
          message:
            "Signup successful, please check your email to verify your account",
        };
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
        if (!user.isVerified)
          throw new Error("Please verify your email before logging in");

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
  },
};

export default userResolver;
