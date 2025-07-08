import express from "express";
import authRoutes from "./auth";
import projectsRoutes from "./project";
import usersRoutes from "./user";
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/projects", projectsRoutes);

export default router;
