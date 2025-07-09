import { Request, Response, NextFunction } from "express";
import Activity from "../models/activity";
import Task from "../models/task";
import Project from "../models/project";

export const logActivity = () => {
  return async (req: any, res: any, next: NextFunction) => {
    // Skip GET requests
    if (req.method === "GET") return next();

    // Store original functions
    const originalSend = res.send.bind(res);
    const originalJson = res.json.bind(res);
    const originalEnd = res.end.bind(res);

    // Response interception
    res.send = function (body?: any): Response {
      logAction(res.statusCode, body);
      return originalSend(body);
    };

    res.json = function (body?: any): Response {
      logAction(res.statusCode, body);
      return originalJson(body);
    };

    res.end = function (...args: any[]): void {
      logAction(res.statusCode);
      originalEnd(...args);
    };

    async function logAction(statusCode: number, body?: any) {
      try {
        // Only log successful operations
        if (statusCode < 200 || statusCode >= 300) return;

        const entityType = req.baseUrl.includes("projects")
          ? "project"
          : req.baseUrl.includes("tasks")
          ? "task"
          : null;

        if (!entityType) return;

        const entityId = req.params.id || (body && body._id);
        if (!entityId) return;

        // Get additional context
        let projectId, entityTitle;
        if (entityType === "task") {
          const task = await Task.findById(entityId)
            .select("title project")
            .lean();
          projectId = task?.project;
          entityTitle = task?.title;
        } else {
          const project = await Project.findById(entityId)
            .select("title")
            .lean();
          projectId = entityId;
          entityTitle = project?.title;
        }

        await Activity.create({
          action:
            req.method === "POST"
              ? "create"
              : req.method === "PATCH"
              ? "update"
              : req.method === "DELETE"
              ? "delete"
              : "other",
          entityType,
          entityId,
          performedBy: (req as any).user._id,
          project: projectId,
          message: `${req.method} ${entityType}: ${entityTitle || entityId}`,
          details: {
            field:
              req.method === "PATCH"
                ? Object.keys(req.body).join(", ")
                : undefined,
            newValue: req.method !== "DELETE" ? body : undefined,
          },
        });
      } catch (error) {
        console.error("Activity logging failed:", error);
      }
    }

    next();
  };
};
