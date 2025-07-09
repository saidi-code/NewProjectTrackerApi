import express from "express";
import { auth } from "../middlewares/auth";
import { acceptInvitation } from "../controllers/invitation";
const router = express.Router();
router.post("/accept", auth, acceptInvitation);

export default router;
