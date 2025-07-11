import express from "express";
import authRoutes from "./auth";
import projectsRoutes from "./project";
import usersRoutes from "./user";
import tasksRoutes from "./task";
import invitationRoutes from "./invitation";
import { logActivity } from "../middlewares/activity";
import { auth } from "../middlewares/auth";
const router = express.Router();
router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/projects", auth, logActivity(), projectsRoutes);
router.use("/tasks", auth, logActivity(), tasksRoutes);
router.use("/invitations", invitationRoutes);
export default router;
