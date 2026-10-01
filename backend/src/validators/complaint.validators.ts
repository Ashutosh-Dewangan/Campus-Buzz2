import { z } from "zod";

export const complaintCategorySchema = z.enum([
  "HOSTEL",
  "MESS_CAFETERIA",
  "CAMPUS_WIFI",
  "LIBRARY_FACILITIES",
  "ACADEMIC",
  "OTHER",
]);

export const createComplaintSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Complaint title is required")
    .max(200, "Complaint title cannot exceed 200 characters"),

  description: z
    .string()
    .trim()
    .min(1, "Complaint description is required")
    .max(5000, "Complaint description cannot exceed 5000 characters"),

  category: complaintCategorySchema.optional(),
});

export type CreateComplaintInput = z.infer<
  typeof createComplaintSchema
>;