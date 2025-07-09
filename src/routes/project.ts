import express from "express";
import { auth } from "../middlewares/auth";
import { validateProject } from "../utils/validators";
import {
  getProject,
  getProjects,
  updateProject,
  createProject,
} from "../controllers/project";
import { acceptInvitation, inviteToProject } from "../controllers/invitation";
import { createTask, getProjectTasks, updateTask } from "../controllers/task";
import { getProjectActivities } from "../controllers/activity";

const router = express.Router();
router.post("/", auth, validateProject(), createProject);
router.get("/", auth, getProjects);
router.get("/:id", auth, getProject);
router.patch("/:id", auth, validateProject(), updateProject);
// ======================
// Task Routes
// ======================
router.post("/:projectId/tasks", auth, createTask);
router.get("/:projectId/tasks", auth, getProjectTasks);

// ======================
// Invitation Routes
// ======================
router.post("/:projectId/invite", auth, inviteToProject);

// ======================
// Activity Routes
// ======================
router.get("/:projectId/activities", auth, getProjectActivities);
export default router;
