import { z } from "zod";

export const loginSchema = z.object({
  rollNumber: z
    .string()
    .trim()
    .min(1, "Roll number is required"),

  instituteEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid institute email"),
});

export type LoginInput = z.infer<typeof loginSchema>;