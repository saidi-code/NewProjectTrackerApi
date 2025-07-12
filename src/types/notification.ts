import { Document, ObjectId } from "mongoose";

export interface INotification extends Document {
  recipient: ObjectId;
  sender?: ObjectId;
  project?: ObjectId;
  type: string;
  message: string;
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PopulatedNotification
  extends Omit<INotification, "recipient" | "sender" | "project"> {
  recipient: { _id: ObjectId; name?: string; email?: string };
  sender?: { _id: ObjectId; name?: string };
  project?: { _id: ObjectId; title?: string };
}
export interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  push: boolean;
  slack?: boolean;
  // Add other channels as needed
}

// For request validation
export interface UpdatePreferencesRequest {
  email?: boolean;
  inApp?: boolean;
  push?: boolean;
  slack?: boolean;
}
