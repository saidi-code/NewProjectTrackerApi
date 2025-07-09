import { Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  description?: string;
  status: "backlog" | "todo" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "critical";
  dueDate?: Date;
  completed: boolean;
  completedAt?: Date;
  project: string; // Project ID
  assignedTo?: string; // User ID
  createdBy: string; // User ID
  labels?: string[];
  estimatedHours?: number;
  actualHours?: number;
  createdAt?: Date;
}

export type TaskResponse = Omit<
  ITask,
  "project" | "assignedTo" | "createdBy"
> & {
  project: {
    _id: string;
    title: string;
  };
  assignedTo?: UserProfile;
  createdBy: UserProfile;
  isOverdue: boolean;
};
