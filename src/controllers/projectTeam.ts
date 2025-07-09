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
      .populate("team.user", "name email avatar role");

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
      "team._id": memberId,
    });

    if (!project) {
      throw new AppError("Project or member not found", 404);
    }

    // Check if requester is admin/owner
    const requester = project.team.find(
      (member) => member.user._id.toString() === req.user._id.toString()
    );

    if (
      !requester ||
      (requester.role !== "owner" && requester.role !== "admin")
    ) {
      throw new AppError("Unauthorized to modify team", 403);
    }

    // Find the target member
    const targetMember = project.team.find(
      (member) => member._id.toString() === memberId
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
        "team._id": memberId,
      },
      {
        $set: { "team.$.role": role },
      },
      { new: true }
    ).populate("team.user", "name email avatar");

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
    // 1. Validate request
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not authenticated" });
    }

    const { teamId, memberId } = req.params;

    if (!Types.ObjectId.isValid(teamId) || !Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ message: "Invalid team or member ID" });
    }

    // 2. Check if the requester is the team owner or has admin rights
    const team = await ProjectTeam.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const isRequesterOwner = team.owner.toString() === req.user._id.toString();
    const isRequesterAdmin = team.admins.some(
      (admin) => admin.toString() === req.user!._id.toString()
    );

    if (!isRequesterOwner && !isRequesterAdmin) {
      return res
        .status(403)
        .json({ message: "Forbidden: Only owners/admins can remove members" });
    }

    // 3. Prevent self-removal if the user is the owner
    if (team.owner.toString() === memberId) {
      return res
        .status(400)
        .json({ message: "Owners cannot remove themselves" });
    }

    // 4. Remove the member
    const updatedTeam = await ProjectTeam.findByIdAndUpdate(
      teamId,
      {
        $pull: {
          members: { user: memberId },
          admins: memberId, // Also remove from admins if applicable
        },
      },
      { new: true }
    ).populate("members.user", "name email"); // Optional: Return populated data

    res.status(200).json({
      message: "Member removed successfully",
      team: updatedTeam,
    });
  } catch (error) {
    console.error("Error removing team member:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
