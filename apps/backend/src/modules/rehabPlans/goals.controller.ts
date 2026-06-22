import { asyncHandler } from "../../lib/async-handler";
import { HttpError } from "../../lib/http-error";
import { createGoal, deleteGoal, listGoals, updateGoal } from "./goals.service";
import {
  createGoalSchema,
  goalIdParamSchema,
  patientIdParamSchema,
  updateGoalSchema,
} from "./goals.schemas";

function getAuthenticatedUserId(user: Express.Request["user"]) {
  if (!user) {
    throw new HttpError(401, "Authentication required");
  }

  return user.id;
}

export const createGoalController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { patientId } = patientIdParamSchema.parse(req.params);
  const data = createGoalSchema.parse(req.body);
  const goal = await createGoal(userId, patientId, data);

  res.status(201).json({ goal });
});

export const listGoalsController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { patientId } = patientIdParamSchema.parse(req.params);
  const goals = await listGoals(userId, patientId);

  res.status(200).json({ goals });
});

export const updateGoalController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { id } = goalIdParamSchema.parse(req.params);
  const data = updateGoalSchema.parse(req.body);
  const goal = await updateGoal(userId, id, data);

  res.status(200).json({ goal });
});

export const deleteGoalController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { id } = goalIdParamSchema.parse(req.params);

  await deleteGoal(userId, id);

  res.status(204).send();
});
