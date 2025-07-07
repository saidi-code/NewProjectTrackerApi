import { Request, Response } from "express";
import Project from "../models/Project";
import { IProject } from "../types/project";

export const createProject = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;

    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,
      team: [{ user: req.user._id, role: "owner" }],
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      "team.user": req.user._id,
    }).populate("team.user", "name email avatar");

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProject = async (req: Request, res: Response) => {
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  try {
    const projects = await Project.find({
      "team.user": req.user._id,
    }).sort("-createdAt");

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
