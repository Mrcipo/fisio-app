import { asyncHandler } from "../../lib/async-handler";
import { HttpError } from "../../lib/http-error";
import {
  createRehabPlan,
  deleteRehabPlan,
  listRehabPlans,
  updateRehabPlan,
} from "./rehabPlans.service";
import {
  createRehabPlanSchema,
  patientIdParamSchema,
  rehabPlanIdParamSchema,
  updateRehabPlanSchema,
} from "./rehabPlans.schemas";

function getAuthenticatedUserId(user: Express.Request["user"]) {
  if (!user) {
    throw new HttpError(401, "Authentication required");
  }

  return user.id;
}

export const createRehabPlanController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { patientId } = patientIdParamSchema.parse(req.params);
  const data = createRehabPlanSchema.parse(req.body);
  const rehabPlan = await createRehabPlan(userId, patientId, data);

  res.status(201).json({ rehabPlan });
});

export const listRehabPlansController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { patientId } = patientIdParamSchema.parse(req.params);
  const rehabPlans = await listRehabPlans(userId, patientId);

  res.status(200).json({ rehabPlans });
});

export const updateRehabPlanController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { id } = rehabPlanIdParamSchema.parse(req.params);
  const data = updateRehabPlanSchema.parse(req.body);
  const rehabPlan = await updateRehabPlan(userId, id, data);

  res.status(200).json({ rehabPlan });
});

export const deleteRehabPlanController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { id } = rehabPlanIdParamSchema.parse(req.params);

  await deleteRehabPlan(userId, id);

  res.status(204).send();
});
