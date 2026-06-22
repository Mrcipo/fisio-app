import { asyncHandler } from "../../lib/async-handler";
import { HttpError } from "../../lib/http-error";
import {
  createExercise,
  deleteExercise,
  getExerciseById,
  listExercises,
  updateExercise,
} from "./exercises.service";
import {
  createExerciseSchema,
  exerciseIdParamSchema,
  updateExerciseSchema,
} from "./exercises.schemas";

function getAuthenticatedUserId(user: Express.Request["user"]) {
  if (!user) {
    throw new HttpError(401, "Authentication required");
  }

  return user.id;
}

export const createExerciseController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const data = createExerciseSchema.parse(req.body);
  const exercise = await createExercise(userId, data);

  res.status(201).json({ exercise });
});

export const listExercisesController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const exercises = await listExercises(userId);

  res.status(200).json({ exercises });
});

export const getExerciseByIdController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { id } = exerciseIdParamSchema.parse(req.params);
  const exercise = await getExerciseById(userId, id);

  res.status(200).json({ exercise });
});

export const updateExerciseController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { id } = exerciseIdParamSchema.parse(req.params);
  const data = updateExerciseSchema.parse(req.body);
  const exercise = await updateExercise(userId, id, data);

  res.status(200).json({ exercise });
});

export const deleteExerciseController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { id } = exerciseIdParamSchema.parse(req.params);

  await deleteExercise(userId, id);

  res.status(204).send();
});
