import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";
import logger from "../utils/logger";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: any,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  if (err instanceof Error) {
    logger.error(err.stack);
    return res.status(500).json({
      status: "error",
      message: err.message || "Internal server error",
    });
  }

  logger.error("Unknown error occurred");
  return res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};
