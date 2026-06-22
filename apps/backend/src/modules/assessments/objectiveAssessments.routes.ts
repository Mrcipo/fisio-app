import { Router } from "express";
import { requireAuth } from "../../middlewares/require-auth";
import {
  createObjectiveAssessmentController,
  deleteObjectiveAssessmentController,
  getObjectiveAssessmentByIdController,
  listObjectiveAssessmentsController,
  updateObjectiveAssessmentController,
} from "./objectiveAssessments.controller";

export const patientObjectiveAssessmentsRouter = Router({ mergeParams: true });
export const objectiveAssessmentsRouter = Router();

patientObjectiveAssessmentsRouter.post("/", createObjectiveAssessmentController);
patientObjectiveAssessmentsRouter.get("/", listObjectiveAssessmentsController);

objectiveAssessmentsRouter.use(requireAuth);
objectiveAssessmentsRouter.get("/:id", getObjectiveAssessmentByIdController);
objectiveAssessmentsRouter.patch("/:id", updateObjectiveAssessmentController);
objectiveAssessmentsRouter.delete("/:id", deleteObjectiveAssessmentController);
