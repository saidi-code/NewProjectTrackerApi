import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: "user" | "admin";
  lastActive?: Date;
  settings: {
    emailNotifications: boolean;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type UserProfile = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
};

export type AuthResponse = UserProfile & {
  token: string;
};
