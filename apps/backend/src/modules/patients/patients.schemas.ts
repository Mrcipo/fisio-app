import { PatientSex } from "@prisma/client";
import { z } from "zod";

const optionalText = z.string().trim().min(1).optional();
const optionalEmail = z.string().trim().email().optional();

export const patientIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const createPatientSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  documentNumber: optionalText,
  dateOfBirth: z.coerce.date().optional(),
  sex: z.nativeEnum(PatientSex).optional(),
  phone: optionalText,
  email: optionalEmail,
  occupation: optionalText,
  address: optionalText,
  notes: optionalText,
});

export const updatePatientSchema = createPatientSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
