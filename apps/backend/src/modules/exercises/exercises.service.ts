import { HttpError } from "../../lib/http-error";
import { prisma } from "../../lib/prisma";
import type { CreateExerciseInput, UpdateExerciseInput } from "./exercises.schemas";

async function findExerciseForUser(exerciseId: string, userId: string) {
  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
  });

  if (!exercise) {
    throw new HttpError(404, "Exercise not found");
  }

  if (exercise.userId !== userId) {
    throw new HttpError(403, "You do not have access to this exercise");
  }

  return exercise;
}

export async function createExercise(userId: string, input: CreateExerciseInput) {
  return prisma.exercise.create({
    data: {
      ...input,
      userId,
    },
  });
}

export async function listExercises(userId: string) {
  return prisma.exercise.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export async function getExerciseById(userId: string, exerciseId: string) {
  return findExerciseForUser(exerciseId, userId);
}

export async function updateExercise(
  userId: string,
  exerciseId: string,
  input: UpdateExerciseInput,
) {
  await findExerciseForUser(exerciseId, userId);

  return prisma.exercise.update({
    where: { id: exerciseId },
    data: input,
  });
}

export async function deleteExercise(userId: string, exerciseId: string) {
  await findExerciseForUser(exerciseId, userId);

  await prisma.exercise.delete({
    where: { id: exerciseId },
  });
}
