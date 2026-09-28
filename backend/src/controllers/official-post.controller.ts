import type { Request, Response } from "express";

import {
  createOfficialPost,
  getOfficialPosts,
} from "../services/official-post.service";

import {
  createOfficialPostSchema,
} from "../validators/official-post.validators";

export async function createOfficialPostController(
  req: Request,
  res: Response,
) {
  if (!req.user) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }

  const result =
    createOfficialPostSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Invalid official post data",
      errors: result.error.issues,
    });
    return;
  }

  try {
    const post = await createOfficialPost(
      req.user.userId,
      result.data,
    );

    res.status(201).json({
      message: "Official post created successfully",
      post,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "You are not an active member of this organization"
    ) {
      res.status(403).json({
        message: error.message,
      });
      return;
    }

    if (
      error instanceof Error &&
      error.message === "Organization not found"
    ) {
      res.status(404).json({
        message: error.message,
      });
      return;
    }

    console.error(
      "Create official post failed:",
      error,
    );

    res.status(500).json({
      message: "Failed to create official post",
    });
  }
}

export async function getOfficialPostsController(
  _req: Request,
  res: Response,
) {
  try {
    const posts = await getOfficialPosts();

    res.json(posts);
  } catch (error) {
    console.error(
      "Get official posts failed:",
      error,
    );

    res.status(500).json({
      message: "Failed to fetch official posts",
    });
  }
}