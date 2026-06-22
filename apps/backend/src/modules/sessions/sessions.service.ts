import { HttpError } from "../../lib/http-error";
import { prisma } from "../../lib/prisma";
import { findPatientForUser } from "../patients/patients.service";
import type {
  CreateSessionInput,
  SessionExerciseInput,
  UpdateSessionInput,
} from "./sessions.schemas";

async function findSessionForUser(sessionId: string, userId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      patient: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!session) {
    throw new HttpError(404, "Session not found");
  }

  if (session.patient.userId !== userId) {
    throw new HttpError(403, "You do not have access to this session");
  }

  return session;
}

async function ensureExercisesBelongToUser(userId: string, exercises: SessionExerciseInput[]) {
  const exerciseIds = [...new Set(exercises.map((exercise) => exercise.exerciseId))];

  if (exerciseIds.length === 0) {
    return;
  }

  const userExercises = await prisma.exercise.findMany({
    where: {
      id: { in: exerciseIds },
      userId,
    },
    select: { id: true },
  });

  if (userExercises.length !== exerciseIds.length) {
    throw new HttpError(403, "One or more exercises do not belong to this user");
  }
}

function mapSessionExercises(exercises: SessionExerciseInput[]) {
  return exercises.map((exercise) => ({
    exerciseId: exercise.exerciseId,
    sets: exercise.sets,
    reps: exercise.reps,
    duration: exercise.duration,
    load: exercise.load,
    rpe: exercise.rpe,
    symptoms: exercise.symptoms,
    notes: exercise.notes,
  }));
}

function splitCreateSessionInput(input: CreateSessionInput) {
  const { exercises, ...sessionData } = input;

  return {
    sessionData,
    exercises,
  };
}

function splitUpdateSessionInput(input: UpdateSessionInput) {
  const { exercises, ...sessionData } = input;

  return {
    sessionData,
    exercises,
  };
}

export async function createSession(
  userId: string,
  patientId: string,
  input: CreateSessionInput,
) {
  await findPatientForUser(patientId, userId);
  await ensureExercisesBelongToUser(userId, input.exercises);

  const { sessionData, exercises } = splitCreateSessionInput(input);

  return prisma.session.create({
    data: {
      ...sessionData,
      patientId,
      sessionExercises: {
        create: mapSessionExercises(exercises),
      },
    },
    include: {
      sessionExercises: true,
    },
  });
}

export async function listSessions(userId: string, patientId: string) {
  await findPatientForUser(patientId, userId);

  return prisma.session.findMany({
    where: { patientId },
    include: {
      sessionExercises: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function getSessionById(userId: string, sessionId: string) {
  await findSessionForUser(sessionId, userId);

  return prisma.session.findUniqueOrThrow({
    where: { id: sessionId },
    include: {
      sessionExercises: true,
    },
  });
}

export async function updateSession(
  userId: string,
  sessionId: string,
  input: UpdateSessionInput,
) {
  await findSessionForUser(sessionId, userId);

  if (input.exercises) {
    await ensureExercisesBelongToUser(userId, input.exercises);
  }

  const { sessionData, exercises } = splitUpdateSessionInput(input);

  return prisma.session.update({
    where: { id: sessionId },
    data: {
      ...sessionData,
      ...(exercises
        ? {
            sessionExercises: {
              deleteMany: {},
              create: mapSessionExercises(exercises),
            },
          }
        : {}),
    },
    include: {
      sessionExercises: true,
    },
  });
}

export async function deleteSession(userId: string, sessionId: string) {
  await findSessionForUser(sessionId, userId);

  await prisma.session.delete({
    where: { id: sessionId },
  });
}
