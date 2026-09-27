import { Router } from "express";

import {
  createMessage,
  closeRoom,
  getRoomForPost,
  getRoomMessages,
  joinRoom,
  leaveRoom,
} from "../controllers/chat.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get(
  "/post/:postId",
  getRoomForPost,
);

router.post(
  "/:roomId/join",
  joinRoom,
);

router.post(
  "/:roomId/leave",
  leaveRoom,
);

router.get(
  "/:roomId/messages",
  getRoomMessages,
);

router.post(
  "/:roomId/messages",
  createMessage,
);

router.post(
  "/:roomId/close",
  closeRoom,
);

export default router;