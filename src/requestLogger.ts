import type { NextFunction, Request, Response } from "express";
import { logger } from "./logger";

export function requestLogger(request: Request, response: Response, next: NextFunction): void {
  const startedAt = Date.now();

  response.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    logger.info(`${request.method} ${request.originalUrl} ${response.statusCode} ${durationMs}ms`);
  });

  next();
}
