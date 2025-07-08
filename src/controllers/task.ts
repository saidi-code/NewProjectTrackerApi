import { Request, Response } from "express";
import Task from "../models/task";
import Project from "../models/project";
import { ITask } from "../types/task";
function isError(error: unknown): error is Error {
  return error instanceof Error;
}
export const createTask = async (req: any, res: any) => {
  try {
    // Check if user has access to the project
    const project = await Project.findOne({
      _id: req.body.project,
      "team.user": req.user._id,
    });

    if (!project) {
      return res
        .status(403)
        .json({ error: "Unauthorized to create tasks in this project" });
    }

    const task = await Task.create({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json(task);
  } catch (error: unknown) {
    if (isError(error)) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
};

export const updateTask = async (req: any, res: any) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { assignedTo: req.user._id },
          { createdBy: req.user._id },
          { project: { $in: await getAdminProjects(req.user._id) } },
        ],
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ error: "Task not found or unauthorized" });
    }

    res.json(task);
  } catch (error: unknown) {
    if (isError(error)) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
};

export const getProjectTasks = async (req: any, res: any) => {
  try {
    // Verify user has access to the project
    const project = await Project.findOne({
      _id: req.params.projectId,
      "team.user": req.user._id,
    });

    if (!project) {
      return res
        .status(403)
        .json({ error: "Unauthorized to view these tasks" });
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .sort("-createdAt")
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name email avatar");

    res.json(tasks);
  } catch (error: unknown) {
    if (isError(error)) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
};

// Helper function
async function getAdminProjects(userId: string) {
  const projects = await Project.find({
    "team.user": userId,
    "team.role": { $in: ["owner", "admin"] },
  });
  return projects.map((p) => p._id);
}
