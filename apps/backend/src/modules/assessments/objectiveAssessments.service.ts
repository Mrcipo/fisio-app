import { HttpError } from "../../lib/http-error";
import { prisma } from "../../lib/prisma";
import { findPatientForUser } from "../patients/patients.service";
import type {
  CreateObjectiveAssessmentInput,
  UpdateObjectiveAssessmentInput,
} from "./objectiveAssessments.schemas";

async function findObjectiveAssessmentForUser(assessmentId: string, userId: string) {
  const assessment = await prisma.objectiveAssessment.findUnique({
    where: { id: assessmentId },
    include: {
      patient: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!assessment) {
    throw new HttpError(404, "Objective assessment not found");
  }

  if (assessment.patient.userId !== userId) {
    throw new HttpError(403, "You do not have access to this objective assessment");
  }

  return assessment;
}

export async function createObjectiveAssessment(
  userId: string,
  patientId: string,
  input: CreateObjectiveAssessmentInput,
) {
  await findPatientForUser(patientId, userId);

  return prisma.objectiveAssessment.create({
    data: {
      ...input,
      patientId,
    },
  });
}

export async function listObjectiveAssessments(userId: string, patientId: string) {
  await findPatientForUser(patientId, userId);

  return prisma.objectiveAssessment.findMany({
    where: { patientId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getObjectiveAssessmentById(userId: string, assessmentId: string) {
  const assessment = await findObjectiveAssessmentForUser(assessmentId, userId);
  const { patient: _patient, ...assessmentData } = assessment;

  return assessmentData;
}

export async function updateObjectiveAssessment(
  userId: string,
  assessmentId: string,
  input: UpdateObjectiveAssessmentInput,
) {
  await findObjectiveAssessmentForUser(assessmentId, userId);

  return prisma.objectiveAssessment.update({
    where: { id: assessmentId },
    data: input,
  });
}

export async function deleteObjectiveAssessment(userId: string, assessmentId: string) {
  await findObjectiveAssessmentForUser(assessmentId, userId);

  await prisma.objectiveAssessment.delete({
    where: { id: assessmentId },
  });
}
