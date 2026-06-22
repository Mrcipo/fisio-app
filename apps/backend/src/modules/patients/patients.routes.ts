import { Router } from "express";
import {
  createPatientController,
  deletePatientController,
  getDashboardSummaryController,
  getPatientByIdController,
  getPatientReportController,
  listPatientsController,
  updatePatientController,
} from "./patients.controller";
import { requireAuth } from "../../middlewares/require-auth";
import { initialAssessmentRouter } from "../assessments/initialAssessment.routes";
import { patientObjectiveAssessmentsRouter } from "../assessments/objectiveAssessments.routes";
import { patientGoalsRouter } from "../rehabPlans/goals.routes";
import { patientRehabPlansRouter } from "../rehabPlans/rehabPlans.routes";
import { patientSessionsRouter } from "../sessions/sessions.routes";
import {
  patientProgressMetricsRouter,
  patientProgressSummaryRouter,
} from "../progressMetrics/progressMetrics.routes";

export const patientsRouter = Router();

patientsRouter.use(requireAuth);

patientsRouter.post("/", createPatientController);
patientsRouter.get("/", listPatientsController);
patientsRouter.get("/summary", getDashboardSummaryController);
patientsRouter.use("/:patientId/initial-assessment", initialAssessmentRouter);
patientsRouter.use("/:patientId/objective-assessments", patientObjectiveAssessmentsRouter);
patientsRouter.use("/:patientId/rehab-plans", patientRehabPlansRouter);
patientsRouter.use("/:patientId/goals", patientGoalsRouter);
patientsRouter.use("/:patientId/sessions", patientSessionsRouter);
patientsRouter.use("/:patientId/progress-metrics", patientProgressMetricsRouter);
patientsRouter.use("/:patientId/progress-summary", patientProgressSummaryRouter);
patientsRouter.get("/:patientId/report", getPatientReportController);
patientsRouter.get("/:id", getPatientByIdController);
patientsRouter.patch("/:id", updatePatientController);
patientsRouter.delete("/:id", deletePatientController);
