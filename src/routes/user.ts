import express from "express";
import { auth } from "../middlewares/auth";
import { getProfile, updateProfile } from "../controllers/user";
const router = express.Router();
router.get("/me", auth, getProfile);
router.patch("/me", auth, updateProfile);

export default router;
