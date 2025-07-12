import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import passport from "passport";
import User from "../models/user";
import { HydratedDocument } from "mongoose";
import { sendEmail, sendPasswordResetEmail } from "../utils/email";
import { IUser } from "../types";
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

export const forgotPassword = async (req: any, res: any) => {
  let user: HydratedDocument<IUser> | null = null;
  try {
    // 1. Get user by email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        message: "No user found with that email address",
      });
    }

    // 2. Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false, validateModifiedOnly: true });

    // 3. Send email
    await sendPasswordResetEmail(user.email, resetToken, req);
    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err: unknown) {
    // Type-safe error handling
    if (err instanceof Error) {
      console.error("Password reset error:", err.message);
    }

    // Type-safe token cleanup
    if (user && "passwordResetToken" in user) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
    }

    return res.status(500).json({
      message: "There was an error sending the email. Try again later!",
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    // 1. Get user based on token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2. If token hasn't expired and user exists, set new password
    if (!user) {
      return res.status(400).json({
        message: "Token is invalid or has expired",
      });
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // 3. Update changedPasswordAt property (add to user model if needed)

    // 4. Log the user in (send JWT)
    const token = generateToken(user._id); // Your existing token generator

    res.status(200).json({
      status: "success",
      token,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error resetting password",
    });
  }
};
