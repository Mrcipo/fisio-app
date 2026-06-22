import { HttpError } from "../../lib/http-error";
import { prisma } from "../../lib/prisma";
import { findPatientForUser } from "../patients/patients.service";
import type {
  CreateInitialAssessmentInput,
  UpdateInitialAssessmentInput,
} from "./initialAssessment.schemas";

export async function createInitialAssessment(
  userId: string,
  patientId: string,
  input: CreateInitialAssessmentInput,
) {
  await findPatientForUser(patientId, userId);

  const existingAssessment = await prisma.initialAssessment.findUnique({
    where: { patientId },
  });

  if (existingAssessment) {
    throw new HttpError(409, "Initial assessment already exists for this patient");
  }

  return prisma.initialAssessment.create({
    data: {
      ...input,
      patientId,
    },
  });
}

export async function getInitialAssessment(userId: string, patientId: string) {
  await findPatientForUser(patientId, userId);

  const assessment = await prisma.initialAssessment.findUnique({
    where: { patientId },
  });

  if (!assessment) {
    throw new HttpError(404, "Initial assessment not found");
  }

  return assessment;
}

export async function updateInitialAssessment(
  userId: string,
  patientId: string,
  input: UpdateInitialAssessmentInput,
) {
  await getInitialAssessment(userId, patientId);

  return prisma.initialAssessment.update({
    where: { patientId },
    data: input,
  });
}
