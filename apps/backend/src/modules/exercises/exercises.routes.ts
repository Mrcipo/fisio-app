import { Router } from "express";
import { requireAuth } from "../../middlewares/require-auth";
import {
  createExerciseController,
  deleteExerciseController,
  getExerciseByIdController,
  listExercisesController,
  updateExerciseController,
} from "./exercises.controller";

export const exercisesRouter = Router();

exercisesRouter.use(requireAuth);

exercisesRouter.post("/", createExerciseController);
exercisesRouter.get("/", listExercisesController);
exercisesRouter.get("/:id", getExerciseByIdController);
exercisesRouter.patch("/:id", updateExerciseController);
exercisesRouter.delete("/:id", deleteExerciseController);
