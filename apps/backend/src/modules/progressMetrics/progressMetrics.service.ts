import { MetricType } from "@prisma/client";
import { HttpError } from "../../lib/http-error";
import { prisma } from "../../lib/prisma";
import { findPatientForUser } from "../patients/patients.service";
import type { CreateProgressMetricInput } from "./progressMetrics.schemas";

async function ensureSessionBelongsToPatient(
  userId: string,
  patientId: string,
  sessionId?: string,
) {
  if (!sessionId) {
    return;
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      patient: {
        select: {
          id: true,
          userId: true,
        },
      },
    },
  });

  if (!session) {
    throw new HttpError(404, "Session not found");
  }

  if (session.patient.userId !== userId || session.patient.id !== patientId) {
    throw new HttpError(403, "Session does not belong to this patient");
  }
}

async function findProgressMetricForUser(metricId: string, userId: string) {
  const progressMetric = await prisma.progressMetric.findUnique({
    where: { id: metricId },
    include: {
      patient: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!progressMetric) {
    throw new HttpError(404, "Progress metric not found");
  }

  if (progressMetric.patient.userId !== userId) {
    throw new HttpError(403, "You do not have access to this progress metric");
  }

  return progressMetric;
}

export async function createProgressMetric(
  userId: string,
  patientId: string,
  input: CreateProgressMetricInput,
) {
  await findPatientForUser(patientId, userId);
  await ensureSessionBelongsToPatient(userId, patientId, input.sessionId);

  return prisma.progressMetric.create({
    data: {
      ...input,
      patientId,
    },
  });
}

export async function listProgressMetrics(userId: string, patientId: string) {
  await findPatientForUser(patientId, userId);

  return prisma.progressMetric.findMany({
    where: { patientId },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });
}

export async function getProgressSummary(userId: string, patientId: string) {
  const metrics = await listProgressMetrics(userId, patientId);

  type ProgressSummaryPoint = {
    id: string;
    name: string;
    value: string;
    unit: string;
    date: Date;
    sessionId: string | null;
  };

  const grouped = {} as Record<MetricType, ProgressSummaryPoint[]>;

  for (const metricType of Object.values(MetricType)) {
    grouped[metricType] = [];
  }

  for (const metric of metrics) {
    grouped[metric.metricType].push({
      id: metric.id,
      name: metric.name,
      value: metric.value.toString(),
      unit: metric.unit,
      date: metric.date,
      sessionId: metric.sessionId,
    });
  }

  return grouped;
}

export async function deleteProgressMetric(userId: string, metricId: string) {
  await findProgressMetricForUser(metricId, userId);

  await prisma.progressMetric.delete({
    where: { id: metricId },
  });
}
