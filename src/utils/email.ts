import nodemailer from "nodemailer";
import config from "../config";

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
