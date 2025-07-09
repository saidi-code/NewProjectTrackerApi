import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../models/user";
import { AppError } from "../utils/error";
import { IUser } from "../types";

// Local Strategy for username/password auth
passport.use(
  new LocalStrategy(
    {
      usernameField: "email", // using email as the username field
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        // 1) Find user by email
        const user: IUser = await User.findOne({ email }).select("+password");
        if (!user) {
          return done(new AppError("Incorrect email or password", 401), false);
        }

        // 2) Check if password is correct
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return done(new AppError("Incorrect email or password", 401), false);
        }

        // 3) If everything ok, return user
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Serialize/Deserialize user
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
