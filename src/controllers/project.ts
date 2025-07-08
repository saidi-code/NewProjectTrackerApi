import { Request, Response } from "express";
import Project from "../models/project";
import { IProject } from "../types/project";
function isError(error: unknown): error is Error {
  return error instanceof Error;
}
export const createProject = async (req: any, res: Response) => {
  try {
    const { title, description } = req.body;

    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,
      team: [{ user: req.user._id, role: "owner" }],
    });

    res.status(201).json(project);
  } catch (error: unknown) {
    if (isError(error)) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
};

export const getProject = async (req: any, res: any) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      "team.user": req.user._id,
    }).populate("team.user", "name email avatar");

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (error: unknown) {
    if (isError(error)) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
};

export const updateProject = async (req: any, res: any) => {
  try {
    const { title, description, status } = req.body;

    const project = await Project.findOneAndUpdate(
      {
        _id: req.params.id,
        "team.user": req.user._id,
        "team.role": { $in: ["owner", "admin"] },
      },
      { title, description, status },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res
        .status(404)
        .json({ error: "Project not found or unauthorized" });
    }

    res.json(project);
  } catch (error: unknown) {
    if (isError(error)) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
};

export const getProjects = async (req: any, res: Response) => {
  try {
    const projects = await Project.find({
      "team.user": req.user._id,
    }).sort("-createdAt");

    res.json(projects);
  } catch (error: unknown) {
    if (isError(error)) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
};
