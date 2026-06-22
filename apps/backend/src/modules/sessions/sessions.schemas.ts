import { ClinicalDecision } from "@prisma/client";
import { z } from "zod";

const optionalText = z.string().trim().min(1).optional();
const painScale = z.number().int().min(0).max(10);
const rpeScale = z.number().int().min(0).max(10);

export const patientIdParamSchema = z.object({
  patientId: z.string().trim().min(1),
});

export const sessionIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const sessionExerciseSchema = z.object({
  exerciseId: z.string().trim().min(1),
  sets: z.number().int().min(1).max(50).optional(),
  reps: z.number().int().min(1).max(500).optional(),
  duration: z.number().int().min(1).optional(),
  load: optionalText,
  rpe: rpeScale.optional(),
  symptoms: optionalText,
  notes: optionalText,
});

export const createSessionSchema = z.object({
  date: z.coerce.date(),
  painBefore: painScale.optional(),
  painAfter: painScale.optional(),
  subjectiveReport: optionalText,
  clinicalNotes: optionalText,
  responseToTreatment: optionalText,
  clinicalDecision: z.nativeEnum(ClinicalDecision).optional(),
  exercises: z.array(sessionExerciseSchema).optional().default([]),
});

export const updateSessionSchema = createSessionSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type SessionExerciseInput = z.infer<typeof sessionExerciseSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
