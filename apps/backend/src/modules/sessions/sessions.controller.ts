import { asyncHandler } from "../../lib/async-handler";
import { HttpError } from "../../lib/http-error";
import { paginationSchema } from "../../lib/pagination";
import {
  createSession,
  deleteSession,
  getSessionById,
  listSessions,
  updateSession,
} from "./sessions.service";
import {
  createSessionSchema,
  patientIdParamSchema,
  sessionIdParamSchema,
  updateSessionSchema,
} from "./sessions.schemas";

function getAuthenticatedUserId(user: Express.Request["user"]) {
  if (!user) {
    throw new HttpError(401, "Authentication required");
  }

  return user.id;
}

export const createSessionController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { patientId } = patientIdParamSchema.parse(req.params);
  const data = createSessionSchema.parse(req.body);
  const session = await createSession(userId, patientId, data);

  res.status(201).json({ session });
});

export const listSessionsController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { patientId } = patientIdParamSchema.parse(req.params);
  const pagination = paginationSchema.parse(req.query);
  const result = await listSessions(userId, patientId, pagination);

  res.status(200).json(result);
});

export const getSessionByIdController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { id } = sessionIdParamSchema.parse(req.params);
  const session = await getSessionById(userId, id);

  res.status(200).json({ session });
});

export const updateSessionController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { id } = sessionIdParamSchema.parse(req.params);
  const data = updateSessionSchema.parse(req.body);
  const session = await updateSession(userId, id, data);

  res.status(200).json({ session });
});

export const deleteSessionController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { id } = sessionIdParamSchema.parse(req.params);

  await deleteSession(userId, id);

  res.status(204).send();
});
