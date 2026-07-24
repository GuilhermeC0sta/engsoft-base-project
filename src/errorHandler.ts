import type { NextFunction, Request, Response } from "express";
import { AppError } from "./errors";
import { logger } from "./logger";

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      message: error.message,
      ...error.details,
    });
    return;
  }

  logger.error("Erro nao tratado na requisicao", error);
  response.status(500).json({ message: "Erro interno do servidor" });
}
