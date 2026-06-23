import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "El email es obligatorio").email("Email inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, "El nombre es obligatorio"),
  lastName: z.string().trim().min(1, "El apellido es obligatorio"),
  email: z.string().trim().min(1, "El email es obligatorio").email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const patientFormSchema = z.object({
  firstName: z.string().trim().min(1, "El nombre es obligatorio"),
  lastName: z.string().trim().min(1, "El apellido es obligatorio"),
  documentNumber: z.string(),
  dateOfBirth: z.string(),
  sex: z.enum(["FEMALE", "MALE", "OTHER", "NOT_SPECIFIED"]),
  phone: z.string(),
  email: z
    .string()
    .trim()
    .refine((value) => value === "" || z.string().email().safeParse(value).success, {
      message: "Email inválido",
    }),
  occupation: z.string(),
  address: z.string(),
  notes: z.string(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type PatientFormValues = z.infer<typeof patientFormSchema>;
