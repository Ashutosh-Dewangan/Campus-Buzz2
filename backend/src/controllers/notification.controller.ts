import { Request, Response } from "express";
import { createNotification } from "../services/notification.service";

import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/notification.service";

function getAuthenticatedUserId(req: Request): string {
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error("Authenticated user not found");
  }

  return userId;
}
  
export async function getNotificationsController(
  req: Request,
  res: Response,
) {
  try {
    const userId = getAuthenticatedUserId(req);

    const notifications =
      await getUserNotifications(userId);

    return res.json(notifications);
  } catch (error) {
    console.error(
      "Get notifications failed:",
      error,
    );

    return res.status(500).json({
      error: "Failed to fetch notifications",
    });
  }
}

export async function markNotificationReadController(
  req: Request,
  res: Response,
) {
  try {
    const userId = getAuthenticatedUserId(req);

    const rawId = req.params.id;
    const notificationId = Array.isArray(rawId)
      ? rawId[0]
      : rawId;

    if (!notificationId) {
      return res.status(400).json({
        error: "Notification ID is required",
      });
    }

    const notification =
      await markNotificationRead(
        userId,
        notificationId,
      );

    return res.json(notification);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Notification not found"
    ) {
      return res.status(404).json({
        error: "Notification not found",
      });
    }

    console.error(
      "Mark notification read failed:",
      error,
    );

    return res.status(500).json({
      error: "Failed to mark notification as read",
    });
  }
}

export async function markAllNotificationsReadController(
  req: Request,
  res: Response,
) {
  try {
    const userId = getAuthenticatedUserId(req);

    const notifications =
      await markAllNotificationsRead(userId);

    return res.json(notifications);
  } catch (error) {
    console.error(
      "Mark all notifications read failed:",
      error,
    );

    return res.status(500).json({
      error: "Failed to mark notifications as read",
    });
  }
}
