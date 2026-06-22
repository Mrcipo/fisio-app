import { asyncHandler } from "../../lib/async-handler";
import { HttpError } from "../../lib/http-error";
import {
  createPatient,
  deletePatient,
  getDashboardSummary,
  getPatientById,
  getPatientReport,
  listPatients,
  updatePatient,
} from "./patients.service";
import {
  createPatientSchema,
  patientIdParamSchema,
  updatePatientSchema,
} from "./patients.schemas";

function getAuthenticatedUserId(user: Express.Request["user"]) {
  if (!user) {
    throw new HttpError(401, "Authentication required");
  }

  return user.id;
}

export const createPatientController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const data = createPatientSchema.parse(req.body);
  const patient = await createPatient(userId, data);

  res.status(201).json({ patient });
});

export const listPatientsController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const patients = await listPatients(userId);

  res.status(200).json({ patients });
});

export const getDashboardSummaryController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const summary = await getDashboardSummary(userId);

  res.status(200).json({ summary });
});

export const getPatientByIdController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { id } = patientIdParamSchema.parse(req.params);
  const patient = await getPatientById(userId, id);

  res.status(200).json({ patient });
});

export const getPatientReportController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const patientId = Array.isArray(req.params.patientId)
    ? req.params.patientId[0]
    : req.params.patientId;
  const reportHtml = await getPatientReport(userId, patientId);

  res.status(200).type("html").send(reportHtml);
});

export const updatePatientController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { id } = patientIdParamSchema.parse(req.params);
  const data = updatePatientSchema.parse(req.body);
  const patient = await updatePatient(userId, id, data);

  res.status(200).json({ patient });
});

export const deletePatientController = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const { id } = patientIdParamSchema.parse(req.params);

  await deletePatient(userId, id);

  res.status(204).send();
});
