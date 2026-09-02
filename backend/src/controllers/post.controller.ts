import type { Request, Response } from "express";

import {
  createCampusBuzzPost,
  getCampusBuzzPosts,
  getPostContact,
} from "../services/post.service";

import {
  createPostSchema,
} from "../validators/post.validators";

import {
  saveUploadedImage,
} from "../services/image-storage.service";

export async function createPost(
  req: Request,
  res: Response,
) {
  if (!req.user) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }

  if (!req.file) {
    res.status(400).json({
      message: "Image is required",
    });
    return;
  }

  let hashtags: unknown[] = [];

  try {
    if (Array.isArray(req.body.hashtags)) {
      hashtags = req.body.hashtags;
    } else if (
      typeof req.body.hashtags === "string"
    ) {
      const parsed = JSON.parse(
        req.body.hashtags,
      );

      if (Array.isArray(parsed)) {
        hashtags = parsed;
      }
    }
  } catch {
    res.status(400).json({
      message: "Invalid hashtags format",
    });
    return;
  }

  let expiresAt: Date | undefined;

  if (req.body.expiresAt) {
    const parsedExpiry = new Date(
      req.body.expiresAt,
    );

    if (Number.isNaN(parsedExpiry.getTime())) {
      res.status(400).json({
        message: "Invalid expiry date",
      });
      return;
    }

    expiresAt = parsedExpiry;
  }

  const result =
    createPostSchema.safeParse({
      title: req.body.title,
      description: req.body.description,
      hashtags,
      contactName:
        req.body.contactName,
      contactPhone:
        req.body.contactPhone,
      expiresAt,
    });

  if (!result.success) {
    res.status(400).json({
      message: "Invalid post data",
      errors: result.error.issues,
    });
    return;
  }

  try {
    const imageUrl =
      await saveUploadedImage(
        req.file,
      );

    const post =
      await createCampusBuzzPost(
        req.user.userId,
        result.data,
        imageUrl,
      );

    res.status(201).json({
      message:
        "Post created successfully",
      post,
    });
  } catch (error) {
    console.error(
      "Create post failed:",
      error,
    );

    res.status(500).json({
      message:
        "Failed to create post",
    });
  }
}

export async function getPosts(
  _req: Request,
  res: Response,
) {
  try {
    const posts =
      await getCampusBuzzPosts();

    res.json(posts);
  } catch (error) {
    console.error(
      "Get posts failed:",
      error,
    );

    res.status(500).json({
      message:
        "Failed to fetch posts",
    });
  }
}

export async function getPostContactInfo(
  req: Request<{ id: string }>,
  res: Response,
) {
  if (!req.user) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }

  const post = await getPostContact(
    req.params.id,
  );

  if (!post) {
    res.status(404).json({
      message:
        "Contact information is not available for this post",
    });
    return;
  }

  if (
    !post.contactName ||
    !post.contactPhone
  ) {
    res.status(404).json({
      message:
        "Contact information is not available",
    });
    return;
  }

  res.json({
    contactName: post.contactName,
    contactPhone: post.contactPhone,
  });
}