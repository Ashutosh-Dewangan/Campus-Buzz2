import type { Request, Response } from "express";
import { emitNewChatMessage } from "../socket";
import {
  closeChatRoom,
  getChatRoomByPostId,
  getMessages,
  joinChatRoom,
  leaveChatRoom,
  sendMessage,
  getActiveRoomMemberIds,
} from "../services/chat.service";

import { createNotification } from "../services/notification.service";

import {
  sendMessageSchema,
} from "../validators/chat.validators";

function getUserId(req: Request): string | null {
  return req.user?.userId ?? null;
}

export async function getRoomForPost(
  req: Request<{ postId: string }>,
  res: Response,
) {
  const userId = getUserId(req);

  if (!userId) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }

  try {
    const room =
      await getChatRoomByPostId(
        req.params.postId,
        userId,
      );

    if (!room) {
      res.status(404).json({
        message: "Chat room not found",
      });
      return;
    }

    res.json(room);
  } catch (error) {
    console.error(
      "Get chat room failed:",
      error,
    );

    res.status(500).json({
      message: "Failed to fetch chat room",
    });
  }
}

export async function joinRoom(
  req: Request<{ roomId: string }>,
  res: Response,
) {
  const userId = getUserId(req);

  if (!userId) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }

  try {
    const member =
      await joinChatRoom(
        req.params.roomId,
        userId,
      );

    res.status(201).json({
      message: "Joined chat room",
      member,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to join chat room";

    if (
      message === "Chat room not found"
    ) {
      res.status(404).json({ message });
      return;
    }

    res.status(400).json({ message });
  }
}

export async function leaveRoom(
  req: Request<{ roomId: string }>,
  res: Response,
) {
  const userId = getUserId(req);

  if (!userId) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }

  try {
    const member =
      await leaveChatRoom(
        req.params.roomId,
        userId,
      );

    res.json({
      message: "Left chat room",
      member,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to leave chat room";

    res.status(400).json({ message });
  }
}

export async function getRoomMessages(
  req: Request<{ roomId: string }>,
  res: Response,
) {
  const userId = getUserId(req);

  if (!userId) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }

  try {
    const messages =
      await getMessages(
        req.params.roomId,
        userId,
      );

    res.json(messages);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch messages";

    res.status(400).json({ message });
  }
}

export async function createMessage(
  req: Request<{ roomId: string }>,
  res: Response,
) {
  const userId = getUserId(req);

  if (!userId) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }

  const result =
    sendMessageSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Invalid message",
      errors: result.error.issues,
    });
    return;
  }

  try {
    const message =
  await sendMessage(
    req.params.roomId,
    userId,
    result.data,
  );

  emitNewChatMessage(
    req.params.roomId,
    message,
  );
  const memberIds =
  await getActiveRoomMemberIds(req.params.roomId);

await Promise.all(
  memberIds
    .filter((memberId) => memberId !== userId)
    .map((memberId) =>
      createNotification({
        userId: memberId,
        type: "ROOM_MESSAGE",
        title: "New message in your coordination room",
        description: `${message.user.name} sent a new message.`,
        link: `/chat/${req.params.roomId}`,
      }),
    ),
);
  res.status(201).json({
    message,
  });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to send message";

    res.status(400).json({ message });
  }
}

export async function closeRoom(
  req: Request<{ roomId: string }>,
  res: Response,
) {
  const userId = getUserId(req);

  if (!userId) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }

  try {
    const room =
      await closeChatRoom(
        req.params.roomId,
        userId,
      );

    res.json({
      message: "Chat room closed",
      room,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to close chat room";

    if (
      message === "Chat room not found"
    ) {
      res.status(404).json({ message });
      return;
    }

    res.status(403).json({ message });
  }
}