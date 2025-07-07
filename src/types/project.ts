import { Document } from "mongoose";

export interface TeamMember {
  user: string; // User ID
  role: "owner" | "admin" | "manager" | "member" | "viewer";
  joinedAt: Date;
  addedBy: string; // User ID
}

export interface IProject extends Document {
  title: string;
  description?: string;
  status: "planning" | "active" | "on-hold" | "completed" | "archived";
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
  createdBy: string; // User ID
  team: TeamMember[];
  settings: {
    taskAssignment: "anyone" | "managers-only" | "specific-roles";
    visibility: "private" | "team-only" | "public";
  };
}

export type ProjectResponse = Omit<IProject, "team"> & {
  team: {
    user: UserProfile;
    role: string;
    joinedAt: Date;
  }[];
};
