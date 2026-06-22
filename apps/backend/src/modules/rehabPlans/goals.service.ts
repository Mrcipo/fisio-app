import { HttpError } from "../../lib/http-error";
import { prisma } from "../../lib/prisma";
import { findPatientForUser } from "../patients/patients.service";
import type { CreateGoalInput, UpdateGoalInput } from "./goals.schemas";

async function findGoalForUser(goalId: string, userId: string) {
  const goal = await prisma.clinicalGoal.findUnique({
    where: { id: goalId },
    include: {
      patient: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!goal) {
    throw new HttpError(404, "Clinical goal not found");
  }

  if (goal.patient.userId !== userId) {
    throw new HttpError(403, "You do not have access to this clinical goal");
  }

  return goal;
}

export async function createGoal(userId: string, patientId: string, input: CreateGoalInput) {
  await findPatientForUser(patientId, userId);

  return prisma.clinicalGoal.create({
    data: {
      ...input,
      patientId,
    },
  });
}

export async function listGoals(userId: string, patientId: string) {
  await findPatientForUser(patientId, userId);

  return prisma.clinicalGoal.findMany({
    where: { patientId },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });
}

export async function updateGoal(userId: string, goalId: string, input: UpdateGoalInput) {
  await findGoalForUser(goalId, userId);

  return prisma.clinicalGoal.update({
    where: { id: goalId },
    data: input,
  });
}

export async function deleteGoal(userId: string, goalId: string) {
  await findGoalForUser(goalId, userId);

  await prisma.clinicalGoal.delete({
    where: { id: goalId },
  });
}
