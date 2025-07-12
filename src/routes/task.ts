import express from "express";
import { auth } from "../middlewares/auth";
import { updateTask } from "../controllers/task";

const router = express.Router();
router.patch("/:id", updateTask);
// router.put("/:id");
export default router;
