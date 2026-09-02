import { z } from "zod";

export const loginSchema = z.object({
  rollNumber: z.string().min(1, "Roll number is required"),
  instituteEmail: z
    .string()
    .email("Invalid institute email"),
});

export type LoginInput = z.infer<typeof loginSchema>;