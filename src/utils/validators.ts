import { Request } from "express";
import { ValidationChain, body } from "express-validator";
import User from "../models/user";

export const validateRegister = (): ValidationChain[] => [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) throw new Error("Email already in use");
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

export const validateLogin = (): ValidationChain[] => [
  body("email").trim().notEmpty().withMessage("Email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const validateProject = (): ValidationChain[] => [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),
  body("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),
];

export const validateRoleUpdate = (): ValidationChain[] => [
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["admin", "member", "viewer", "manager"])
    .withMessage("Invalid role"),
];

export const validateNotificationPreferences = (): ValidationChain[] => [
  // Validate each preference field
  body("email")
    .optional()
    .isBoolean()
    .withMessage("Email preference must be a boolean"),
  body("inApp")
    .optional()
    .isBoolean()
    .withMessage("In-app preference must be a boolean"),
  body("push")
    .optional()
    .isBoolean()
    .withMessage("Push preference must be a boolean"),
  body("slack")
    .optional()
    .isBoolean()
    .withMessage("Slack preference must be a boolean"),

  // Custom validation for at least one enabled channel
  body().custom((body) => {
    const preferences = ["email", "inApp", "push", "slack"];
    const atLeastOneEnabled = preferences.some((pref) => body[pref] === true);
    if (!atLeastOneEnabled) {
      throw new Error("At least one notification channel must be enabled");
    }
    return true;
  }),
];
