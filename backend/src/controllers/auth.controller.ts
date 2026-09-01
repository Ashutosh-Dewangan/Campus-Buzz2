import type { Request, Response } from "express";
import { loginSchema } from "../validators/auth.validators";
import { loginUser } from "../services/auth.service";

export async function login(req: Request, res: Response) {
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      message: "Invalid request data",
      errors: validation.error.issues,
    });
    return;
  }

  try {
    const result = await loginUser(validation.data);

    res.status(200).json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Invalid roll number or institute email"
    ) {
      res.status(401).json({
        message: error.message,
      });
      return;
    }

    console.error("Login error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}