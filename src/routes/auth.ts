import express from "express";
import { validateLogin, validateRegister } from "../utils/validators";
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/auth";
const router = express.Router();
router.post("/register", validateRegister(), register);
router.post("/login", validateLogin(), login);
router.get("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
