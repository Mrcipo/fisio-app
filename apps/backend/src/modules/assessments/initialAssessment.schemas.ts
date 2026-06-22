import { z } from "zod";

const optionalText = z.string().trim().min(1).optional();
const painScale = z.number().int().min(0).max(10);

export const patientIdParamSchema = z.object({
  patientId: z.string().trim().min(1),
});

export const createInitialAssessmentSchema = z.object({
  reasonForConsultation: z.string().trim().min(1),
  onsetDate: z.coerce.date().optional(),
  injuryMechanism: optionalText,
  medicalDiagnosis: optionalText,
  currentPain: painScale.optional(),
  maxPain: painScale.optional(),
  minPain: painScale.optional(),
  painLocation: optionalText,
  painType: optionalText,
  irradiation: optionalText,
  aggravatingFactors: optionalText,
  relievingFactors: optionalText,
  neurologicalSymptoms: optionalText,
  previousSurgeries: optionalText,
  medications: optionalText,
  relevantHistory: optionalText,
  redFlags: optionalText,
  patientGoals: optionalText,
  limitedActivities: optionalText,
});

export const updateInitialAssessmentSchema = createInitialAssessmentSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type CreateInitialAssessmentInput = z.infer<typeof createInitialAssessmentSchema>;
export type UpdateInitialAssessmentInput = z.infer<typeof updateInitialAssessmentSchema>;
