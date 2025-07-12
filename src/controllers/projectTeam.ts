import { Request, Response } from "express";
import Project from "../models/project";
import { AppError } from "../utils/error";
import { IUser } from "../types";
import { Types } from "mongoose";

function isError(error: unknown): error is Error {
  return error instanceof Error;
}
// Get all team members
export const getProjectTeam = async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .select("team")
      .populate("team.members.user", "name email avatar role");

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    res.json({
      status: "success",
      data: project.team,
    });
  } catch (error: unknown) {
    if (isError(error)) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
};

// Update team member role
export const updateTeamMemberRole = async (req: any, res: any) => {
  try {
    const { projectId, memberId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ["owner", "admin", "member", "viewer", "manager"];
    if (!validRoles.includes(role)) {
      throw new AppError("Invalid role specified", 400);
    }

    // Find the project first to verify permissions
    const project = await Project.findOne({
      _id: projectId,
      "team.members.user": memberId,
    });

    if (!project) {
      throw new AppError("Project or member not found", 404);
    }

    // Check if requester is admin/owner
    const requester = project.team.members.find(
      (member) => member.user === req.user._id
    );

    if (
      !requester ||
      (requester.role !== "owner" && requester.role !== "admin")
    ) {
      throw new AppError("Unauthorized to modify team", 403);
    }

    // Find the target member
    const targetMember = project.team.members.find(
      (member) => member === memberId
    );

    if (!targetMember) {
      throw new AppError("Member not found", 404);
    }

    // Prevent modifying owners unless you're an owner
    if (targetMember.role === "owner" && requester.role !== "owner") {
      throw new AppError("Only owners can modify other owners", 403);
    }

    // Prevent changing role to owner unless you're an owner
    if (role === "owner" && requester.role !== "owner") {
      throw new AppError("Only owners can assign owner role", 403);
    }

    // Perform the update

    res.locals.oldDoc = project;
    const updatedProject = await Project.findOneAndUpdate(
      {
        _id: projectId,
        "team.members.user._id": memberId,
      },
      {
        $set: { "team.members.$.role": role }, // Correct path to update
      },
      { new: true }
    ).populate("team.members.user", "name email avatar");

    res.json(updatedProject);
  } catch (error: unknown) {
    if (isError(error)) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
};

// Remove team member
export const removeTeamMember = async (req: any, res: any) => {
  try {
    // 1. Authentication check
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { projectId, memberId } = req.params; // Changed from teamId to projectId

    // 2. Validate IDs
    if (
      !Types.ObjectId.isValid(projectId) ||
      !Types.ObjectId.isValid(memberId)
    ) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // 3. Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 4. Convert IDs for comparison
    const requesterId = req.user._id.toString();
    const targetMemberId = new Types.ObjectId(memberId).toString();

    // 5. Find requester in team
    const requester = project.team.members.find(
      (member) => member.user.toString() === requesterId
    );

    // 6. Authorization check
    if (!requester) {
      return res
        .status(403)
        .json({ message: "You're not part of this project" });
    }

    // Only owners and admins can remove members
    if (requester.role !== "owner" && requester.role !== "admin") {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    // 7. Find target member
    const targetMemberIndex = project.team.members.findIndex(
      (member) => member.user.toString() === targetMemberId
    );

    if (targetMemberIndex === -1) {
      return res.status(404).json({ message: "Member not found in project" });
    }

    // 8. Prevent owner self-removal
    if (project.team.members[targetMemberIndex].role === "owner") {
      return res.status(400).json({ message: "Owner cannot be removed" });
    }

    // 9. Remove member from team array
    project.team.members.splice(targetMemberIndex, 1);

    // 10. Save the updated project
    const updatedProject = await project.save();

    res.status(200).json({
      message: "Member removed successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error in removeTeamMember:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
