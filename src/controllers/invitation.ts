import { Request, Response } from "express";
import Invitation from "../models/Invitation";
import Project from "../models/Project";
import User from "../models/User";
import { sendInvitationEmail } from "../services/email";

export const inviteToProject = async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;

    // Check if user has permission to invite
    const project = await Project.findOne({
      _id: req.params.projectId,
      "team.user": req.user._id,
      "team.role": { $in: ["owner", "admin"] },
    });

    if (!project) {
      return res
        .status(403)
        .json({ error: "Unauthorized to invite to this project" });
    }

    // Check if user already in project
    const existingMember = project.team.find(
      (m) => m.user?.toString() === email || m.email === email
    );
    if (existingMember) {
      return res.status(400).json({ error: "User already in project" });
    }

    // Create invitation
    const invitation = await Invitation.create({
      project: project._id,
      email,
      role,
      invitedBy: req.user._id,
    });

    // Send email
    await sendInvitationEmail(email, project.title, role, invitation.token);

    res.status(201).json(invitation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const acceptInvitation = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    const invitation = await Invitation.findOne({
      token,
      status: "pending",
      tokenExpires: { $gt: Date.now() },
    }).populate("project");

    if (!invitation) {
      return res.status(400).json({ error: "Invalid or expired invitation" });
    }

    // Add user to project team
    await Project.findByIdAndUpdate(invitation.project._id, {
      $addToSet: {
        team: {
          user: req.user._id,
          role: invitation.role,
          addedBy: invitation.invitedBy,
        },
      },
    });

    // Update invitation status
    invitation.status = "accepted";
    invitation.acceptedAt = new Date();
    await invitation.save();

    res.json({
      success: true,
      project: invitation.project,
      role: invitation.role,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
