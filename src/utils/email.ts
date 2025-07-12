import nodemailer from "nodemailer";
import config from "../config/config";

const transporter = nodemailer.createTransport({
  service: config.EMAIL_SERVICE,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from: `"Task Manager" <${config.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
};

export const sendInvitationEmail = async (
  email: string,
  projectName: string,
  role: string,
  token: string
) => {
  const acceptUrl = `${config.CLIENT_URL}/accept-invitation?token=${token}`;
  const html = `
    <h2>Project Invitation</h2>
    <p>You've been invited to join <strong>${projectName}</strong> as a <strong>${role}</strong>.</p>
    <a href="${acceptUrl}">Accept Invitation</a>
    <p>This link expires in 24 hours.</p>
  `;
  await sendEmail(email, `Invitation to join ${projectName}`, html);
};

export const sendTaskCompletionEmail = async (
  email: string,
  taskDetails: {
    title: string;
    projectName: string;
    completedBy: string;
    dueDate?: Date;
    priority?: "low" | "medium" | "high";
    taskUrl: string;
  }
) => {
  const { title, projectName, completedBy, dueDate, priority, taskUrl } =
    taskDetails;

  const formattedDueDate = dueDate
    ? new Date(dueDate).toLocaleDateString()
    : "No deadline";
  const priorityBadge = priority
    ? `
    <span style="
      background-color: ${
        priority === "high"
          ? "#f44336"
          : priority === "medium"
          ? "#ff9800"
          : "#4caf50"
      };
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.8em;
    ">
      ${priority.toUpperCase()}
    </span>
  `
    : "";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Task Completed</h2>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #2c3e50;">${title}</h3>
        <p><strong>Project:</strong> ${projectName}</p>
        <p><strong>Completed by:</strong> ${completedBy}</p>
        ${priority ? `<p><strong>Priority:</strong> ${priorityBadge}</p>` : ""}
        <p><strong>Due date:</strong> ${formattedDueDate}</p>
      </div>

      <a href="${taskUrl}" style="
        display: inline-block;
        background-color: #4CAF50;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 4px;
        margin-bottom: 20px;
      ">
        View Task Details
      </a>

      <p style="color: #666; font-size: 0.9em;">
        You're receiving this notification because you're an admin/manager of this project.
        <a href="${
          config.CLIENT_URL
        }/notification-settings" style="color: #3498db;">
          Update notification preferences
        </a>
      </p>
    </div>
  `;

  await sendEmail(email, `[Completed] ${title} • ${projectName}`, html);
};

export const sendTeamJoinConfirmationEmail = async (
  email: string,
  details: {
    projectName: string;
    role: string;
    inviterName: string;
    projectUrl: string;
    teamDashboardUrl: string;
  }
) => {
  const { projectName, role, inviterName, projectUrl, teamDashboardUrl } =
    details;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to ${projectName}</h2>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <p>You've successfully joined <strong>${projectName}</strong> as a <strong>${role}</strong>.</p>
        <p>Invited by: ${inviterName}</p>
      </div>

      <div style="margin-bottom: 20px;">
        <a href="${projectUrl}" style="
          display: inline-block;
          background-color: #3498db;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 4px;
          margin-right: 10px;
        ">
          Go to Project
        </a>

        <a href="${teamDashboardUrl}" style="
          display: inline-block;
          background-color: #2ecc71;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 4px;
        ">
          View Team
        </a>
      </div>

      <p style="color: #666; font-size: 0.9em;">
        You can now access all project resources and collaborate with your team members.
        <a href="${config.CLIENT_URL}/help/getting-started" style="color: #3498db;">
          Getting started guide
        </a>
      </p>
    </div>
  `;

  await sendEmail(email, `You've joined ${projectName}`, html);
};
export const sendNewMemberJoinEmail = async ({
  recipientEmail,
  projectName,
  newMemberName,
  role,
  projectUrl,
  teamUrl,
}: {
  recipientEmail: string;
  projectName: string;
  newMemberName: string;
  role: string;
  projectUrl: string;
  teamUrl: string;
}) => {
  const subject = `New team member: ${newMemberName} joined ${projectName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">New Team Member</h2>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <p style="font-size: 16px; margin-bottom: 10px;">
          <strong>${newMemberName}</strong> has joined your project 
          <strong>${projectName}</strong> as a <strong>${role}</strong>.
        </p>
        
        <div style="margin-top: 20px;">
          <a href="${teamUrl}" 
            style="background-color: #3498db; color: white; padding: 10px 15px; 
            text-decoration: none; border-radius: 4px; display: inline-block; margin-right: 10px;">
            View Team
          </a>
          <a href="${projectUrl}" 
            style="background-color: #2ecc71; color: white; padding: 10px 15px; 
            text-decoration: none; border-radius: 4px; display: inline-block;">
            Go to Project
          </a>
        </div>
      </div>
      
      <p style="color: #7f8c8d; font-size: 14px;">
        You received this notification because you're an admin of this project.
        <a href="${config.CLIENT_URL}/notification-settings" 
          style="color: #3498db; text-decoration: none;">
          Manage notifications
        </a>
      </p>
    </div>
  `;

  await sendEmail(recipientEmail, subject, html);
};
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  req: Request
) => {
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/reset-password/${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Request</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #2563eb;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          padding: 30px;
          background-color: #f9fafb;
          border-radius: 0 0 8px 8px;
          border: 1px solid #e5e7eb;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #2563eb;
          color: white !important;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          font-size: 14px;
          color: #6b7280;
          text-align: center;
        }
        .code {
          font-family: monospace;
          background-color: #f3f4f6;
          padding: 2px 4px;
          border-radius: 4px;
          color: #dc2626;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Password Reset Request</h1>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p>We received a request to reset your password. Click the button below to proceed:</p>
        
        <a href="${resetUrl}" class="button">Reset Your Password</a>
        
        <p>If you didn't request this, please ignore this email. The password reset link will expire in <strong>10 minutes</strong>.</p>
        
        <p>Alternatively, you can copy and paste this URL into your browser:</p>
        <p><span class="code">${resetUrl}</span></p>
        
        <div class="footer">
          <p>If you have any questions, contact our support team at <a href="mailto:support@yourdomain.com">support@yourdomain.com</a></p>
          <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    email,
    subject: "Your password reset token (valid for 10 minutes)",
    html,
  });
};
