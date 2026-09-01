import type { NextFunction, Request, Response } from "express";
import prisma from "../lib/prisma";

export async function requireOrganizationMembership(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }

  const organizationId = Array.isArray(req.params.organizationId)
  ? req.params.organizationId[0]
  : req.params.organizationId;
  
  if (!organizationId) {
    res.status(400).json({
      message: "Organization ID is required",
    });
    return;
  }

  try {
    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.user.userId,
        organizationId,
        status: "ACTIVE",
      },
    });

    if (!membership) {
      res.status(403).json({
        message: "Active organization membership required",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Organization membership check failed:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}