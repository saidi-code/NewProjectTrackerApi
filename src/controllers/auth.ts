import { Request, Response, NextFunction } from "express";
import passport from "passport";
import User from "../models/user";

import { IUser } from "../types/user";
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

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

export const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", (err: Error, user: any, info: any) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: info.message || "Login failed",
      });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);

      return res.json({
        status: "success",
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      });
    });
  })(req, res, next);
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
