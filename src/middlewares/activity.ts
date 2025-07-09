import { Request, Response, NextFunction } from "express";
import Activity from "../models/activity";
import Task from "../models/task";
import Project from "../models/project";

export const logActivity = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Only log POST, PATCH, DELETE requests
    if (!["POST", "PATCH", "DELETE"].includes(req.method)) {
      return next();
    }

    const originalSend = res.send.bind(res);
    const originalJson = res.json.bind(res);
    const originalEnd = res.end.bind(res);

    let hasLogged = false;

    function triggerLog(statusCode: number, body?: any) {
      if (hasLogged || statusCode < 200 || statusCode >= 300) return;
      hasLogged = true;
      void logAction(statusCode, body);
    }

    res.send = function (body?: any): Response {
      triggerLog(res.statusCode, parseBody(body));
      return originalSend(body);
    };

    res.json = function (body?: any): Response {
      triggerLog(res.statusCode, body);
      return originalJson(body);
    };

    res.end = function (...args: any[]): Response {
      triggerLog(res.statusCode);
      return originalEnd(...args);
    };

    function parseBody(body: any) {
      try {
        return typeof body === "string" ? JSON.parse(body) : body;
      } catch {
        return undefined;
      }
    }

    async function logAction(statusCode: number, body?: any) {
      try {
        const entityType = req.baseUrl.includes("tasks")
          ? "task"
          : req.baseUrl.includes("projects")
          ? "project"
          : null;

        if (!entityType) return;

        const entityId = req.params.id || body?._id || body?.id;
        if (!entityId) return;

        let projectId: string | undefined;
        let entityTitle: string | undefined;

        if (entityType === "task") {
          const task = await Task.findById(entityId)
            .select("title project")
            .lean();
          projectId = task?.project?.toString();
          entityTitle = task?.title;
        } else {
          const project = await Project.findById(entityId)
            .select("title")
            .lean();
          projectId = entityId;
          entityTitle = project?.title;
        }

        let oldValue, newValue;
        if (req.method === "PATCH") {
          oldValue = res.locals.oldDoc || {};
          newValue = body || {};
        } else if (req.method !== "DELETE") {
          newValue = body;
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
          performedBy: (req.user as any)?._id,
          project: projectId,
          message: `${req.method} ${entityType}: ${entityTitle || entityId}`,
          details: {
            field:
              req.method === "PATCH"
                ? Object.keys(req.body).join(", ")
                : undefined,
            oldValue,
            newValue,
          },
        });
      } catch (error) {
        console.error("⚠️ Activity log failed:", error);
      }
    }

    next();
  };
};
