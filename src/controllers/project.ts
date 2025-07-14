import { Request, Response } from "express";
import Project from "../models/project";
import { IProject } from "../types/project";
import { validationResult } from "express-validator";

interface QueryParams {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: string;
  limit?: string;
  createdBy?: string;
}
function isError(error: unknown): error is Error {
  return error instanceof Error;
}
export const createProject = async (req: any, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      // @ts-expect-error: 'path' might not exist on error, but we want to access it
      path: error.path,
      msg: error.msg,
    }));
    return res.status(400).json({ errors: errorMessages });
  }

  try {
    const { title, description, startDate, endDate } = req.body;

    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,
      team: {
        members: [{ user: req.user._id, role: "owner" }],
      },
      startDate,
      endDate,
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
      "team.members.user": req.user._id,
    }).populate("team.members.user", "name email avatar");

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
    const oldProject = await Project.findById(req.params.id).lean();
    res.locals.oldDoc = oldProject;
    const project = await Project.findOneAndUpdate(
      {
        _id: req.params.id,
        "team.members.user": req.user._id,
        "team.members.role": { $in: ["owner", "admin"] },
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

export const getProjects = async (req: Request, res: Response) => {
  try {
    const {
      createdBy,
      status,
      startDate,
      endDate,
      page = "1",
      limit = "10",
    } = req.query as QueryParams;

    // 1) Create base filter
    const filter: any = {};

    // 2) Add status filter if provided
    if (status) {
      filter.status = status;
    }
    if (createdBy) {
      filter.createdBy = createdBy;
    }
    // 3) Add date range filters
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    // 4) Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // 5) Execute query
    const projects = await Project.find(filter)
      .sort({ startDate: 1 }) // Sort by startDate ascending
      .skip(skip)
      .limit(limitNum);

    // 6) Count total documents for pagination info
    const total = await Project.countDocuments(filter);

    res.json({
      status: "success",
      results: projects.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: projects,
    });
  } catch (error: unknown) {
    if (isError(error)) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
};
