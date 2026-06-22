import { Router } from "express";
import { requireAuth } from "../../middlewares/require-auth";
import {
  createSessionController,
  deleteSessionController,
  getSessionByIdController,
  listSessionsController,
  updateSessionController,
} from "./sessions.controller";

export const patientSessionsRouter = Router({ mergeParams: true });
export const sessionsRouter = Router();

patientSessionsRouter.post("/", createSessionController);
patientSessionsRouter.get("/", listSessionsController);

sessionsRouter.use(requireAuth);
sessionsRouter.get("/:id", getSessionByIdController);
sessionsRouter.patch("/:id", updateSessionController);
sessionsRouter.delete("/:id", deleteSessionController);
