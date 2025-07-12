import express from "express";
import { auth } from "../middlewares/auth";
import {
  getProfile,
  updateProfile,
  updateNotificationPreferences,
} from "../controllers/user";
import { validateNotificationPreferences } from "../utils";
const router = express.Router();
router.get("/me", auth, getProfile);
router.patch("/me", auth, updateProfile);
router.put(
  "/settings/notification",
  auth,
  validateNotificationPreferences(),
  updateNotificationPreferences
);

export default router;
