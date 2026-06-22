import { Router } from "express";
import { requireAuth } from "../../middlewares/require-auth";
import {
  createProgressMetricController,
  deleteProgressMetricController,
  getProgressSummaryController,
  listProgressMetricsController,
} from "./progressMetrics.controller";

export const patientProgressMetricsRouter = Router({ mergeParams: true });
export const patientProgressSummaryRouter = Router({ mergeParams: true });
export const progressMetricsRouter = Router();

patientProgressMetricsRouter.post("/", createProgressMetricController);
patientProgressMetricsRouter.get("/", listProgressMetricsController);

patientProgressSummaryRouter.get("/", getProgressSummaryController);

progressMetricsRouter.use(requireAuth);
progressMetricsRouter.delete("/:id", deleteProgressMetricController);
