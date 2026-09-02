import { z } from "zod";

export const interactionHashtags = [
  "#foodsplit",
  "#cabsplit",
  "#resell",
  "#lost",
  "#found",
] as const;

export const createPostSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),

    description: z
      .string()
      .trim()
      .min(1, "Description is required"),

    hashtags: z
      .array(
        z
          .string()
          .trim()
          .toLowerCase()
          .regex(/^#[a-z0-9_]+$/, "Invalid hashtag format"),
      )
      .min(1, "At least one hashtag is required")
      .max(3, "A maximum of 3 hashtags is allowed"),

    contactName: z.string().trim().min(1).optional(),

    contactPhone: z.string().trim().min(1).optional(),

    expiresAt: z.coerce.date().optional(),
  })
  .superRefine((data, ctx) => {
    const uniqueHashtags = new Set(data.hashtags);

    if (uniqueHashtags.size !== data.hashtags.length) {
      ctx.addIssue({
        code: "custom",
        path: ["hashtags"],
        message: "Hashtags must be unique",
      });
    }

    const interactionTags = data.hashtags.filter((hashtag) =>
      interactionHashtags.includes(
        hashtag as (typeof interactionHashtags)[number],
      ),
    );

    if (interactionTags.length !== 1) {
      ctx.addIssue({
        code: "custom",
        path: ["hashtags"],
        message:
          "Exactly one interaction hashtag is required",
      });

      return;
    }

    const interactionHashtag = interactionTags[0];

    const needsContact =
      interactionHashtag === "#resell" ||
      interactionHashtag === "#lost" ||
      interactionHashtag === "#found";

    const needsExpiry =
      interactionHashtag === "#foodsplit" ||
      interactionHashtag === "#cabsplit";

    if (needsContact) {
      if (!data.contactName) {
        ctx.addIssue({
          code: "custom",
          path: ["contactName"],
          message: "Contact name is required",
        });
      }

      if (!data.contactPhone) {
        ctx.addIssue({
          code: "custom",
          path: ["contactPhone"],
          message: "Contact phone is required",
        });
      }
    }

    if (needsExpiry && data.expiresAt) {
      const now = Date.now();
      const expiry = data.expiresAt.getTime();

      const minimumExpiry =
        now + 10 * 60 * 1000;

      const maximumExpiry =
        now + 2 * 24 * 60 * 60 * 1000;

      if (
        expiry < minimumExpiry ||
        expiry > maximumExpiry
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["expiresAt"],
          message:
            "Expiry must be between 10 minutes and 2 days",
        });
      }
    }

    if (!needsExpiry && data.expiresAt) {
      ctx.addIssue({
        code: "custom",
        path: ["expiresAt"],
        message:
          "This post type cannot have an expiry",
      });
    }

    if (!needsExpiry && !needsContact) {
      // No additional fields required.
    }
  });

export type CreatePostInput =
  z.infer<typeof createPostSchema>;