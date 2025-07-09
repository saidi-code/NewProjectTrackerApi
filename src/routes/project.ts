import express from "express";
import { validateProject } from "../utils/validators";
import { validateRoleUpdate } from "../utils/validators";
import {
  getProjectTeam,
  updateTeamMemberRole,
  removeTeamMember,
} from "../controllers/projectTeam";
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
router.post("/", validateProject(), createProject);
router.get("/", getProjects);
router.get("/:id", getProject);
router.patch("/:id", validateProject(), updateProject);
// ======================
// Task Routes
// ======================
router.post("/:projectId/tasks", createTask);
router.get("/:projectId/tasks", getProjectTasks);

// ======================
// Invitation Routes
// ======================
router.post("/:projectId/invite", inviteToProject);

// ======================
// Activity Routes
// ======================
router.get("/:projectId/activities", getProjectActivities);

// ======================
// Team Routes
// ======================

// Get project team
router.get("/:projectId/team", getProjectTeam);
// Update member role
router.patch(
  "/:projectId/team/:memberId",
  validateRoleUpdate,
  updateTeamMemberRole
);
// Remove member
router.delete("/:projectId/team/:memberId", removeTeamMember);
export default router;
