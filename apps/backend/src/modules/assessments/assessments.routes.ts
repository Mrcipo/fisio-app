import { Router } from "express";

export const assessmentsRouter = Router();

assessmentsRouter.get("/", (_req, res) => {
  res.status(200).json({
    module: "assessments",
    status: "ready",
  });
});
