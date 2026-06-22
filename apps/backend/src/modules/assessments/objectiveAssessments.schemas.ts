import { BodyRegion } from "@prisma/client";
import { z } from "zod";

const optionalText = z.string().trim().min(1).optional();

export const patientIdParamSchema = z.object({
  patientId: z.string().trim().min(1),
});

export const objectiveAssessmentIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const createObjectiveAssessmentSchema = z.object({
  bodyRegion: z.nativeEnum(BodyRegion),
  postureObservation: optionalText,
  rangeOfMotion: optionalText,
  strength: optionalText,
  functionalTests: optionalText,
  specialTests: optionalText,
  palpationFindings: optionalText,
  movementQuality: optionalText,
  balance: optionalText,
  gait: optionalText,
  notes: optionalText,
});

export const updateObjectiveAssessmentSchema = createObjectiveAssessmentSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type CreateObjectiveAssessmentInput = z.infer<
  typeof createObjectiveAssessmentSchema
>;
export type UpdateObjectiveAssessmentInput = z.infer<
  typeof updateObjectiveAssessmentSchema
>;
