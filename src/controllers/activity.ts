import { Request, Response } from "express";
import Activity from "../models/activity";
import Project from "../models/project";
function isError(error: unknown): error is Error {
  return error instanceof Error;
}
export const getProjectActivities = async (req: any, res: any) => {
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
  } catch (error: unknown) {
    if (isError(error)) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
};
