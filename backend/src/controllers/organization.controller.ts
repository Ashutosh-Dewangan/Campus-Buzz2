import type { Request, Response } from "express";
import { getOrganizations } from "../services/organization.service";

export async function getOrganizationsController(
  _req: Request,
  res: Response,
) {
  try {
    const organizations = await getOrganizations();

    res.json(organizations);
  } catch (error) {
    console.error("Failed to fetch organizations:", error);

    res.status(500).json({
      message: "Failed to fetch organizations",
    });
  }
}