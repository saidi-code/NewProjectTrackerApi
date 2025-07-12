import Notification from "../models/notification";
import { INotification, TeamMember, TeamMemberUser } from "../types";
import Project from "../models/project";
import User from "../models/user";
import Task from "../models/task";
import { Types } from "mongoose";
import config from "../config/config";
import { sendNewMemberJoinEmail, sendTeamJoinConfirmationEmail } from "./email";
interface PopulatedProject {
  _id: Types.ObjectId;
  title: string;
  createdBy: Types.ObjectId | TeamMemberUser;
  team: {
    members: TeamMember[];
  };
}
interface TeamNotificationPayload {
  projectId: Types.ObjectId;
  newMemberId: Types.ObjectId;
  newMemberName: string;
  role: string;
}
// Type Guards
function isPopulatedUser(user: any): user is TeamMemberUser {
  return user && (user as TeamMemberUser)._id instanceof Types.ObjectId;
}

/**
 * Creates notifications when a task is completed
 */
export const createTaskCompletedNotification = async (
  taskId: Types.ObjectId,
  completedByUserId: Types.ObjectId
) => {
  try {
    const task = await Task.findById(taskId)
      .populate("project", "title team.members")
      .populate("assignedTo", "name")
      .lean();

    if (!task || !task.project) return;

    const completedBy = await User.findById(completedByUserId).lean();
    if (!completedBy) return;

    const project = task.project as unknown as PopulatedProject;
    const adminMembers = project.team.members
      .filter((member) => ["owner", "admin", "manager"].includes(member.role))
      .map((member) => ({
        userId: isPopulatedUser(member.user) ? member.user._id : member.user,
        user: isPopulatedUser(member.user) ? member.user : undefined,
      }));

    const notifications = adminMembers.map(({ userId, user }) => ({
      recipient: userId,
      sender: completedByUserId,
      project: project._id,
      type: "task_completed",
      message: `Task "${task.title}" in ${project.title} was completed by ${completedBy.name}`,
      metadata: {
        taskId,
        projectId: project._id,
        completedBy: {
          userId: completedByUserId,
          name: completedBy.name,
        },
      },
    }));

    await Notification.insertMany(notifications);

    // Optional: Send real-time updates via Socket.IO
    emitSocketNotification({
      type: "task:completed",
      data: {
        taskId,
        projectId: project._id,
        completedBy: completedByUserId,
      },
      recipients: adminMembers.map((m) => m.userId),
    });
  } catch (error) {
    console.error("Failed to create task completion notifications:", error);
  }
};

export const createNewMemberNotifications = async ({
  projectId,
  newMemberId,
  newMemberName,
  role,
}: {
  projectId: Types.ObjectId;
  newMemberId: Types.ObjectId;
  newMemberName: string;
  role: string;
}) => {
  try {
    const project = await Project.findById(projectId)
      .populate<{ createdBy: TeamMemberUser }>("createdBy")
      .populate<{ "team.members.user": TeamMemberUser }>("team.members.user");

    if (!project) {
      throw new Error("Project not found");
    }

    // Prepare recipients list
    const recipients: TeamMemberUser[] = [];

    // Add project creator if not the new member
    if (
      isPopulatedUser(project.createdBy) &&
      !project.createdBy._id.equals(newMemberId)
    ) {
      recipients.push(project.createdBy);
    }

    // Add admin team members
    project.team.members.forEach((member) => {
      if (isPopulatedUser(member.user)) {
        const isAdmin = ["owner", "admin", "manager", "member"].includes(
          member.role
        );
        const isNotNewMember = !member.user._id.equals(newMemberId);

        if (isAdmin && isNotNewMember) {
          recipients.push(member.user);
        }
      }
    });

    // Create notifications
    const notifications = recipients.map((recipient) => ({
      recipient: recipient._id,
      sender: newMemberId,
      project: projectId,
      type: "team_member_joined",
      message: `${newMemberName} has joined ${project.title} as ${role}`,
      metadata: {
        projectId,
        newMemberId,
        role,
        projectTitle: project.title,
      },
    }));

    await Notification.insertMany(notifications);

    // Send emails to recipients with email notifications enabled
    // 4. Send email notifications to those who opted in

    await Promise.all(
      recipients
        .filter((user) => {
          // Explicit check for email existence and notification preference
          return user.email && user.settings.notificationPreferences?.email;
        })
        .map((user) => {
          console.log("Email send to" + user.email);
          // TypeScript now knows user.email is definitely string here
          return sendNewMemberJoinEmail({
            recipientEmail: user.email,
            projectName: project.title,
            newMemberName,
            role,
            projectUrl: `${config.CLIENT_URL}/projects/${projectId}`,
            teamUrl: `${config.CLIENT_URL}/projects/${projectId}/team`,
          });
        })
    );
    // 5. Send real-time notification via Socket.IO
    emitSocketNotification({
      type: "team:member_joined",
      data: {
        projectId,
        newMemberId,
        newMemberName,
        role,
      },
      recipients: recipients.map((user) => user._id),
    });
  } catch (error) {
    console.error("Failed to create new member notifications:", error);
  }
};
// Helper Functions
async function sendEmailNotification(
  email: string,
  content: { title: string; body: string }
) {
  // Implement your email service integration here
  console.log(`Sending email to ${email}: ${content.title}`);
}

function emitSocketNotification(payload: {
  type: string;
  data: any;
  recipients: Types.ObjectId[];
}) {
  // Implement your Socket.IO emission logic here
  console.log(`Emitting ${payload.type} to ${payload.recipients.length} users`);
}
