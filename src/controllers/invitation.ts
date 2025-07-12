import { Request, Response } from "express";
import crypto from "crypto";
import Invitation from "../models/invitation";
import Notification from "../models/notification";
import Project from "../models/project";
import User from "../models/user";
import { sendInvitationEmail } from "../utils/email";
import { createNewMemberNotifications } from "../utils/notification";
import { emitNotification } from "../services/socketService";
import { IProject } from "../types";
function isError(error: unknown): error is Error {
  return error instanceof Error;
}
export const inviteToProject = async (req: any, res: any) => {
  try {
    const { email, role } = req.body;

    // Check if user has permission to invite
    const project = await Project.findOne({
      _id: req.params.projectId,
      "team.members.user": req.user._id,
      "team.members.role": { $in: ["owner", "admin"] },
    });

    if (!project) {
      return res
        .status(403)
        .json({ error: "Unauthorized to invite to this project" });
    }
    // Check if user already in project
    const existingMember = project.team.members.find(
      (m) => m.user?.toString() === email || m.email === email
    );
    if (existingMember) {
      return res.status(400).json({ error: "User already in project" });
    }

    // Create invitation
    const token = crypto.randomBytes(32).toString("hex");
    const invitation = await Invitation.create({
      project: project._id,
      email,
      role,
      invitedBy: req.user._id,
      token,
      tokenExpires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
    });

    // Send email
    await sendInvitationEmail(email, project.title, role, invitation.token);

    res.status(201).json(invitation);
  } catch (error: unknown) {
    if (isError(error)) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
};

export const acceptInvitation = async (req: any, res: any) => {
  try {
    const { token } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const invitation = await Invitation.findOne({
      token,
      status: "pending",
      tokenExpires: { $gt: Date.now() },
    }).populate("project");

    if (!invitation) {
      return res.status(400).json({ error: "Invalid or expired invitation" });
    }

    // Add user to project team
    const project = await Project.findByIdAndUpdate(
      invitation.project._id,
      {
        $addToSet: {
          "team.members": {
            user: req.user._id,
            role: invitation.role,
            joinedAt: new Date(),
            addedBy: invitation.invitedBy,
          },
        },
        $pull: {
          "team.invitations": { _id: invitation._id },
        },
      },
      { new: true }
    ).populate("team.members.user", "name email");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    // Update invitation status
    invitation.status = "accepted";
    invitation.acceptedAt = new Date();
    await invitation.save();
    // 5. Send notifications
    await createNewMemberNotifications({
      projectId: project.id,
      newMemberId: userId,
      newMemberName: user.name,
      role: invitation.role,
    });
    res.json({
      success: true,
      project: invitation.project,
      role: invitation.role,
    });
  } catch (error: unknown) {
    if (isError(error)) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
};
