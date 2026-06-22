import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8, "Password must have at least 8 characters"),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
