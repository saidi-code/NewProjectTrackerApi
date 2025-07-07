import { Request, Response } from "express";
import Activity from "../models/activity";
import Project from "../models/Project";

export const getProjectActivities = async (req: Request, res: Response) => {
  try {
    // Verify user has access to the project
    const project = await Project.findOne({
      _id: req.params.projectId,
      "team.user": req.user._id,
    });

    if (!project) {
      return res.status(403).json({ error: "Unauthorized to view activities" });
    }

    const activities = await Activity.find({
      project: req.params.projectId,
    })
      .sort("-createdAt")
      .limit(50)
      .populate("performedBy", "name avatar");

    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
