import { z } from "zod";

const uuidShape = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const eventFields = {
  name: z
    .string()
    .trim()
    .min(1, "Event name is required")
    .max(200, "Event name cannot exceed 200 characters"),

  date: z
    .string()
    .trim()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Event date must be in the format YYYY-MM-DD",
    ),

  time: z
    .string()
    .trim()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Event time must be in the format HH:MM (24-hour format)",
    ),

  venue: z
    .string()
    .trim()
    .min(1, "Venue is required")
    .max(300, "Venue cannot exceed 300 characters"),

  description: z
    .string()
    .trim()
    .min(1, "Event description is required")
    .max(5000, "Event description cannot exceed 5000 characters"),

  organizationId: z
    .string()
    .regex(uuidShape, "Invalid organization ID")
    .optional(),

  linkedOfficialPostId: z
    .string()
    .regex(uuidShape, "Invalid official post ID")
    .optional(),
};

export const createEventSchema = z.object(eventFields);

export const updateEventSchema = z
  .object(eventFields)
  .partial();

export type CreateEventInput = z.infer<
  typeof createEventSchema
>;

export type UpdateEventInput = z.infer<
  typeof updateEventSchema
>;