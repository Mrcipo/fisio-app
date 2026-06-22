import { asyncHandler } from "../../lib/async-handler";
import { HttpError } from "../../lib/http-error";
import {
  createObjectiveAssessment,
  deleteObjectiveAssessment,
  getObjectiveAssessmentById,
  listObjectiveAssessments,
  updateObjectiveAssessment,
} from "./objectiveAssessments.service";
import {
  createObjectiveAssessmentSchema,
  objectiveAssessmentIdParamSchema,
  patientIdParamSchema,
  updateObjectiveAssessmentSchema,
} from "./objectiveAssessments.schemas";

function getAuthenticatedUserId(user: Express.Request["user"]) {
  if (!user) {
    throw new HttpError(401, "Authentication required");
  }

  return user.id;
}

export const createObjectiveAssessmentController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { patientId } = patientIdParamSchema.parse(req.params);
  const data = createObjectiveAssessmentSchema.parse(req.body);
  const objectiveAssessment = await createObjectiveAssessment(userId, patientId, data);

  res.status(201).json({ objectiveAssessment });
});

export const listObjectiveAssessmentsController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { patientId } = patientIdParamSchema.parse(req.params);
  const objectiveAssessments = await listObjectiveAssessments(userId, patientId);

  res.status(200).json({ objectiveAssessments });
});

export const getObjectiveAssessmentByIdController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { id } = objectiveAssessmentIdParamSchema.parse(req.params);
  const objectiveAssessment = await getObjectiveAssessmentById(userId, id);

  res.status(200).json({ objectiveAssessment });
});

export const updateObjectiveAssessmentController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { id } = objectiveAssessmentIdParamSchema.parse(req.params);
  const data = updateObjectiveAssessmentSchema.parse(req.body);
  const objectiveAssessment = await updateObjectiveAssessment(userId, id, data);

  res.status(200).json({ objectiveAssessment });
});

export const deleteObjectiveAssessmentController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { id } = objectiveAssessmentIdParamSchema.parse(req.params);

  await deleteObjectiveAssessment(userId, id);

  res.status(204).send();
});
