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
        if (!user || !(await user.comparePassword(password))) {
          return done(null, false, { message: "Incorrect email or password" });
        }
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
    const user: any = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
