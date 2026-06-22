import { BodyRegion } from "@prisma/client";
import { z } from "zod";

const optionalText = z.string().trim().min(1).optional();

export const exerciseIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const createExerciseSchema = z.object({
  name: z.string().trim().min(1),
  description: optionalText,
  bodyRegion: z.nativeEnum(BodyRegion).optional(),
  objective: optionalText,
  defaultSets: z.number().int().min(1).max(50).optional(),
  defaultReps: z.number().int().min(1).max(500).optional(),
  defaultDuration: z.number().int().min(1).optional(),
  defaultLoad: optionalText,
  precautions: optionalText,
});

export const updateExerciseSchema = createExerciseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;
