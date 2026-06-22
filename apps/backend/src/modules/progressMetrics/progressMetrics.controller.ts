import { asyncHandler } from "../../lib/async-handler";
import { HttpError } from "../../lib/http-error";
import {
  createProgressMetric,
  deleteProgressMetric,
  getProgressSummary,
  listProgressMetrics,
} from "./progressMetrics.service";
import {
  createProgressMetricSchema,
  patientIdParamSchema,
  progressMetricIdParamSchema,
} from "./progressMetrics.schemas";

function getAuthenticatedUserId(user: Express.Request["user"]) {
  if (!user) {
    throw new HttpError(401, "Authentication required");
  }

  return user.id;
}

export const createProgressMetricController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { patientId } = patientIdParamSchema.parse(req.params);
  const data = createProgressMetricSchema.parse(req.body);
  const progressMetric = await createProgressMetric(userId, patientId, data);

  res.status(201).json({ progressMetric });
});

export const listProgressMetricsController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { patientId } = patientIdParamSchema.parse(req.params);
  const progressMetrics = await listProgressMetrics(userId, patientId);

  res.status(200).json({ progressMetrics });
});

export const getProgressSummaryController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { patientId } = patientIdParamSchema.parse(req.params);
  const progressSummary = await getProgressSummary(userId, patientId);

  res.status(200).json({ progressSummary });
});

export const deleteProgressMetricController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { id } = progressMetricIdParamSchema.parse(req.params);

  await deleteProgressMetric(userId, id);

  res.status(204).send();
});
