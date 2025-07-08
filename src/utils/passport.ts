import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import User from "../models/user"; // Your user model
import { passportVerify } from "./auth";

// Strategy configuration
passport.use(
  new LocalStrategy(
    {
      usernameField: "email", // or 'username' depending on your auth
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });

        if (!user) return done(null, false, { message: "Invalid credentials" });

        // 2. Verify password
        const isMatch = await passportVerify(user, password);
        if (!isMatch)
          return done(null, false, { message: "Invalid credentials" });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Serialization
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
