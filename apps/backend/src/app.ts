import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "./lib/async-handler";
import { prisma } from "./lib/prisma";
import { errorHandler } from "./middlewares/error-handler";
import { notFoundHandler } from "./middlewares/not-found-handler";
import { apiRouter } from "./routes";
import { authRouter } from "./modules/auth/auth.routes";
import { objectiveAssessmentsRouter } from "./modules/assessments/objectiveAssessments.routes";
import { patientsRouter } from "./modules/patients/patients.routes";
import { rehabPlansRouter } from "./modules/rehabPlans/rehabPlans.routes";
import { goalsRouter } from "./modules/rehabPlans/goals.routes";
import { exercisesRouter } from "./modules/exercises/exercises.routes";
import { sessionsRouter } from "./modules/sessions/sessions.routes";
import { progressMetricsRouter } from "./modules/progressMetrics/progressMetrics.routes";

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.ALLOWED_ORIGIN ?? "http://localhost:3000" }));
  app.use(express.json());

  app.get(
    "/health",
    asyncHandler(async (_req, res) => {
      try {
        await prisma.$queryRaw`SELECT 1`;

        res.status(200).json({
          status: "ok",
          database: "ok",
        });
      } catch {
        res.status(503).json({
          status: "degraded",
          database: "unavailable",
        });
      }
    }),
  );

  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
  app.use("/auth", authLimiter, authRouter);
  app.use("/patients", patientsRouter);
  app.use("/objective-assessments", objectiveAssessmentsRouter);
  app.use("/rehab-plans", rehabPlansRouter);
  app.use("/goals", goalsRouter);
  app.use("/exercises", exercisesRouter);
  app.use("/sessions", sessionsRouter);
  app.use("/progress-metrics", progressMetricsRouter);
  app.use("/api", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
