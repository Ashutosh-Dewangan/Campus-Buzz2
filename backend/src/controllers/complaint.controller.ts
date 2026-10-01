import type { Request, Response } from "express";
import {
  createComplaint,
  getComplaints,
  resolveComplaint,
} from "../services/complaint.service";
import { createComplaintSchema } from "../validators/complaint.validators";

function getAuthenticatedUser(req: Request) {
  if (!req.user) {
    throw new Error("Authentication required");
  }

  return req.user;
}

export async function getComplaintsController(
  req: Request,
  res: Response,
) {
  try {
    const user = getAuthenticatedUser(req);

    const complaints = await getComplaints(
      user.userId,
      user.role,
    );

    res.json(complaints);
  } catch (error) {
    console.error("Failed to fetch complaints:", error);

    if (
      error instanceof Error &&
      error.message === "Authentication required"
    ) {
      return res.status(401).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to fetch complaints",
    });
  }
}

export async function createComplaintController(
  req: Request,
  res: Response,
) {
  try {
    const user = getAuthenticatedUser(req);

    const parsed = createComplaintSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Invalid complaint",
      });
    }

    const complaint = await createComplaint(
      user.userId,
      parsed.data,
    );

    return res.status(201).json(complaint);
  } catch (error) {
    console.error("Failed to create complaint:", error);

    if (
      error instanceof Error &&
      error.message === "Authentication required"
    ) {
      return res.status(401).json({
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message === "User not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to create complaint",
    });
  }
}

export async function resolveComplaintController(
  req: Request,
  res: Response,
) {
  try {
    const user = getAuthenticatedUser(req);

    const complaintId = req.params.id;

    if (typeof complaintId !== "string" || !complaintId) {
      return res.status(400).json({
        message: "Invalid complaint ID",
      });
    }

    const complaint = await resolveComplaint(
      complaintId,
      user.userId,
      user.role,
    );

    return res.json(complaint);
  } catch (error) {
    console.error("Failed to resolve complaint:", error);

    if (!(error instanceof Error)) {
      return res.status(500).json({
        message: "Failed to resolve complaint",
      });
    }

    if (error.message === "Authentication required") {
      return res.status(401).json({
        message: error.message,
      });
    }

    if (error.message === "Complaint not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (
      error.message ===
      "You are not allowed to resolve this complaint"
    ) {
      return res.status(403).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to resolve complaint",
    });
  }
}