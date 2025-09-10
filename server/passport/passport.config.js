import passport from "passport";
import { GraphQLLocalStrategy as LocalStrategy } from "graphql-passport";
import User from "../models/user.model.js"; // mongoose user model
import bcrypt from "bcryptjs";

// Local strategy (username + password)
export const configurePassport = async () => {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username });
        if (!user) return done(null, false, { message: "No user" });

        const match = await bcrypt.compare(password, user.password);
        return match
          ? done(null, user)
          : done(null, false, { message: "Bad password" });
      } catch (err) {
        return done(err);
      }
    })
  );

  // Sessions
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
