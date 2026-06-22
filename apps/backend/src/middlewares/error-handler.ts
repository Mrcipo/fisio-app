import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "../lib/http-error";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: "Validation error",
        details: error.flatten(),
      },
    });
  }

  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      error: {
        message: error.message,
        details: error.details,
      },
    });
  }

  console.error(error);

  return res.status(500).json({
    error: {
      message: "Internal server error",
    },
  });
};
