import { Router } from "express";
import { assessmentsRouter } from "../modules/assessments/assessments.routes";
import { objectiveAssessmentsRouter } from "../modules/assessments/objectiveAssessments.routes";
import { authRouter } from "../modules/auth/auth.routes";
import { exercisesRouter } from "../modules/exercises/exercises.routes";
import { patientsRouter } from "../modules/patients/patients.routes";
import { goalsRouter } from "../modules/rehabPlans/goals.routes";
import { rehabPlansRouter } from "../modules/rehabPlans/rehabPlans.routes";
import { progressMetricsRouter } from "../modules/progressMetrics/progressMetrics.routes";
import { sessionsRouter } from "../modules/sessions/sessions.routes";

export const apiRouter = Router();

apiRouter.get("/", (_req, res) => {
  res.status(200).json({
    name: "fisioterapia-api",
    status: "ready",
  });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/patients", patientsRouter);
apiRouter.use("/assessments", assessmentsRouter);
apiRouter.use("/objective-assessments", objectiveAssessmentsRouter);
apiRouter.use("/sessions", sessionsRouter);
apiRouter.use("/rehab-plans", rehabPlansRouter);
apiRouter.use("/goals", goalsRouter);
apiRouter.use("/exercises", exercisesRouter);
apiRouter.use("/progress-metrics", progressMetricsRouter);
