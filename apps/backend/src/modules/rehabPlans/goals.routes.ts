import { Router } from "express";
import { requireAuth } from "../../middlewares/require-auth";
import {
  createGoalController,
  deleteGoalController,
  listGoalsController,
  updateGoalController,
} from "./goals.controller";

export const patientGoalsRouter = Router({ mergeParams: true });
export const goalsRouter = Router();

patientGoalsRouter.post("/", createGoalController);
patientGoalsRouter.get("/", listGoalsController);

goalsRouter.use(requireAuth);
goalsRouter.patch("/:id", updateGoalController);
goalsRouter.delete("/:id", deleteGoalController);
