import { RehabPlanPhase, RehabPlanStatus } from "@prisma/client";
import { z } from "zod";

const optionalText = z.string().trim().min(1).optional();

export const patientIdParamSchema = z.object({
  patientId: z.string().trim().min(1),
});

export const rehabPlanIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const createRehabPlanSchema = z.object({
  title: z.string().trim().min(1),
  description: optionalText,
  phase: z.nativeEnum(RehabPlanPhase),
  frequencyPerWeek: z.number().int().min(1).max(14).optional(),
  status: z.nativeEnum(RehabPlanStatus).optional(),
});

export const updateRehabPlanSchema = createRehabPlanSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type CreateRehabPlanInput = z.infer<typeof createRehabPlanSchema>;
export type UpdateRehabPlanInput = z.infer<typeof updateRehabPlanSchema>;
