import { Router } from "express";
import { requireAuth } from "../../middlewares/require-auth";
import {
  createRehabPlanController,
  deleteRehabPlanController,
  listRehabPlansController,
  updateRehabPlanController,
} from "./rehabPlans.controller";

export const patientRehabPlansRouter = Router({ mergeParams: true });
export const rehabPlansRouter = Router();

patientRehabPlansRouter.post("/", createRehabPlanController);
patientRehabPlansRouter.get("/", listRehabPlansController);

rehabPlansRouter.use(requireAuth);
rehabPlansRouter.patch("/:id", updateRehabPlanController);
rehabPlansRouter.delete("/:id", deleteRehabPlanController);
