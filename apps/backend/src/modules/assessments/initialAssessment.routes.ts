import { Router } from "express";
import {
  createInitialAssessmentController,
  getInitialAssessmentController,
  updateInitialAssessmentController,
} from "./initialAssessment.controller";

export const initialAssessmentRouter = Router({ mergeParams: true });

initialAssessmentRouter.post("/", createInitialAssessmentController);
initialAssessmentRouter.get("/", getInitialAssessmentController);
initialAssessmentRouter.patch("/", updateInitialAssessmentController);
