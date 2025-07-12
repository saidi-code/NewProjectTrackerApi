import { Document, Types, ObjectId } from "mongoose";

export interface TeamMemberUser {
  _id: Types.ObjectId;
  name?: string;
  email: string;
  settings: {
    notificationPreferences?: {
      email?: boolean;
      app?: boolean;
    };
  };
}
export interface TeamMember {
  user: Types.ObjectId | TeamMemberUser;
  role: "owner" | "admin" | "manager" | "member" | "viewer";
  joinedAt: Date;
  email?: string;
  addedBy?: ObjectId;
}

export interface IProject extends Document {
  title: string;
  description?: string;
  status: "planning" | "active" | "on-hold" | "completed" | "archived";
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
  createdBy: ObjectId;
  team: {
    members: TeamMember[];
  };
  settings: {
    taskAssignment: "anyone" | "managers-only" | "specific-roles";
    visibility: "private" | "team-only" | "public";
  };
  getAdminIds(): Types.ObjectId[];
}
