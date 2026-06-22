import { HttpError } from "../../lib/http-error";
import { prisma } from "../../lib/prisma";
import { findPatientForUser } from "../patients/patients.service";
import type { CreateRehabPlanInput, UpdateRehabPlanInput } from "./rehabPlans.schemas";

async function findRehabPlanForUser(rehabPlanId: string, userId: string) {
  const rehabPlan = await prisma.rehabPlan.findUnique({
    where: { id: rehabPlanId },
    include: {
      patient: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!rehabPlan) {
    throw new HttpError(404, "Rehab plan not found");
  }

  if (rehabPlan.patient.userId !== userId) {
    throw new HttpError(403, "You do not have access to this rehab plan");
  }

  return rehabPlan;
}

export async function createRehabPlan(
  userId: string,
  patientId: string,
  input: CreateRehabPlanInput,
) {
  await findPatientForUser(patientId, userId);

  return prisma.rehabPlan.create({
    data: {
      ...input,
      patientId,
    },
  });
}

export async function listRehabPlans(userId: string, patientId: string) {
  await findPatientForUser(patientId, userId);

  return prisma.rehabPlan.findMany({
    where: { patientId },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateRehabPlan(
  userId: string,
  rehabPlanId: string,
  input: UpdateRehabPlanInput,
) {
  await findRehabPlanForUser(rehabPlanId, userId);

  return prisma.rehabPlan.update({
    where: { id: rehabPlanId },
    data: input,
  });
}

export async function deleteRehabPlan(userId: string, rehabPlanId: string) {
  await findRehabPlanForUser(rehabPlanId, userId);

  await prisma.rehabPlan.delete({
    where: { id: rehabPlanId },
  });
}
