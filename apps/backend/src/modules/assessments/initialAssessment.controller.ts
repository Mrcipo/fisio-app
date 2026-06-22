import { asyncHandler } from "../../lib/async-handler";
import { HttpError } from "../../lib/http-error";
import {
  createInitialAssessment,
  getInitialAssessment,
  updateInitialAssessment,
} from "./initialAssessment.service";
import {
  createInitialAssessmentSchema,
  patientIdParamSchema,
  updateInitialAssessmentSchema,
} from "./initialAssessment.schemas";

function getAuthenticatedUserId(user: Express.Request["user"]) {
  if (!user) {
    throw new HttpError(401, "Authentication required");
  }

  return user.id;
}

export const createInitialAssessmentController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { patientId } = patientIdParamSchema.parse(req.params);
  const data = createInitialAssessmentSchema.parse(req.body);
  const initialAssessment = await createInitialAssessment(userId, patientId, data);

  res.status(201).json({ initialAssessment });
});

export const getInitialAssessmentController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { patientId } = patientIdParamSchema.parse(req.params);
  const initialAssessment = await getInitialAssessment(userId, patientId);

  res.status(200).json({ initialAssessment });
});

export const updateInitialAssessmentController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { patientId } = patientIdParamSchema.parse(req.params);
  const data = updateInitialAssessmentSchema.parse(req.body);
  const initialAssessment = await updateInitialAssessment(userId, patientId, data);

  res.status(200).json({ initialAssessment });
});
