import { z } from "zod";

export const createOfficialPostSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(200, "Title cannot exceed 200 characters"),

    content: z
      .string()
      .trim()
      .min(1, "Content is required")
      .max(5000, "Content cannot exceed 5000 characters"),

    link: z
      .string()
      .trim()
      .url("Invalid link")
      .optional()
      .or(z.literal("")),

    formUrl: z
      .string()
      .trim()
      .url("Invalid Google Form URL")
      .optional()
      .or(z.literal("")),

    organizationId: z
      .string()
      .regex(
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
        "Invalid organization ID", 
    ),
  })
  .transform((data) => ({
    ...data,
    link: data.link || undefined,
    formUrl: data.formUrl || undefined,
  }));

export type CreateOfficialPostInput =
  z.infer<typeof createOfficialPostSchema>;