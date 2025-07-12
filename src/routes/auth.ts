import express from "express";
import { validateLogin, validateRegister } from "../utils/validators";
import { register, login, logout } from "../controllers/auth";
const router = express.Router();
router.post("/register", validateRegister(), register);
router.post("/login", validateLogin(), login);
router.get("/logout", logout);

export default router;
