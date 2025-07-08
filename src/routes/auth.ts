import express from "express";
import { validateLogin, validateRegister } from "../utils/validators";
import { register, login } from "../controllers/auth";
const router = express.Router();
router.post("/register", validateRegister(), register);
router.post("/login", validateLogin(), login);

export default router;
