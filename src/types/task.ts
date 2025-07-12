import { Document, Types } from "mongoose";

export interface ITask extends Document {
  _id: Types.ObjectId;
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
