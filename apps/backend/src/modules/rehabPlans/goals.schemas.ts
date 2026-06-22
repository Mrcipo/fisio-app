import { ClinicalGoalPriority, ClinicalGoalStatus } from "@prisma/client";
import { z } from "zod";

export const patientIdParamSchema = z.object({
  patientId: z.string().trim().min(1),
});

export const goalIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const createGoalSchema = z.object({
  description: z.string().trim().min(1),
  targetDate: z.coerce.date().optional(),
  status: z.nativeEnum(ClinicalGoalStatus).optional(),
  priority: z.nativeEnum(ClinicalGoalPriority).optional(),
});

export const updateGoalSchema = createGoalSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
