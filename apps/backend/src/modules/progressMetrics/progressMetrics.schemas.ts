import { MetricType, MetricUnit } from "@prisma/client";
import { z } from "zod";

export const patientIdParamSchema = z.object({
  patientId: z.string().trim().min(1),
});

export const progressMetricIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const createProgressMetricSchema = z.object({
  metricType: z.nativeEnum(MetricType),
  name: z.string().trim().min(1),
  value: z.number(),
  unit: z.nativeEnum(MetricUnit),
  date: z.coerce.date(),
  sessionId: z.string().trim().min(1).optional(),
});

export type CreateProgressMetricInput = z.infer<typeof createProgressMetricSchema>;
