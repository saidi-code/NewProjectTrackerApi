import { Request, Response } from "express";
import User from "../models/user";
import { IUser } from "../types/user";
import { NotificationPreferences, UpdatePreferencesRequest } from "../types";
function isError(error: unknown): error is Error {
  return error instanceof Error;
}
export const getProfile = async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error: unknown) {
    if (isError(error)) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
};

export const updateProfile = async (req: any, res: any) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error: unknown) {
    if (isError(error)) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
};

export const updateNotificationPreferences = async (req: any, res: any) => {
  try {
    const { email, inApp, push, slack } = req.body;

    const update: Partial<NotificationPreferences> = {};
    if (email !== undefined) update.email = email;
    if (inApp !== undefined) update.inApp = inApp;
    if (push !== undefined) update.push = push;
    if (slack !== undefined) update.slack = slack;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { "team.members.$.settings.notificationPreferences": update } },
      { new: true, runValidators: true }
    ).select("notificationPreferences");

    res.json(user?.settings?.notificationPreferences);
  } catch (error) {
    res.status(500).json({ message: "Failed to update preferences" });
  }
};
