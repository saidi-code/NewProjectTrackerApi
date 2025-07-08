import { Request, Response } from "express";
import User from "../models/user";

import { IUser } from "../types/user";
function isError(error: unknown): error is Error {
  return error instanceof Error;
}
import passport from "passport";
export const register = async (req: Request, res: any, next: any) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: Request, res: any, next: any) => {
  try {
    const { email, password } = req.body;
    const user: IUser = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        res.status(400).json({ msg: info.message });
      }

      req.logIn(user, (err: any) => {
        if (err) return next(err);

        res.status(200).json({
          msg: "Successfully logged in!",
          user: { name: user.name, email: user.email, id: user._id },
        });
      });
    })(req, res, next);

    res.json({
      msg: "Successfully logged in!",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error: unknown) {
    if (isError(error)) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
};

export const logout = (req: Request, res: any, next: any) => {
  // Type guard for check if user is logged in
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  req.logout((err: any) => {
    if (err) {
      return next(err);
    }

    // Destroy session completely
    req.session.destroy((sessionErr: any) => {
      if (sessionErr) {
        console.error("Session destruction error:", sessionErr);
        return next(sessionErr);
      }

      // Clear the session cookie
      res.clearCookie("connect.sid"); // Default session cookie name

      // Different responses for API vs web
      return res.json({ message: "Successfully logged out" });
    });
  });
};
