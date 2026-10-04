import { Router } from "express";

import {
  getNotificationsController,
  markNotificationReadController,
  markAllNotificationsReadController,
  createTestNotificationController,
} from "../controllers/notification.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  getNotificationsController,
);

router.patch(
  "/:id/read",
  markNotificationReadController,
);

router.patch(
  "/read-all",
  markAllNotificationsReadController,
);

router.post(
  "/test",
  createTestNotificationController,
);

export default router;