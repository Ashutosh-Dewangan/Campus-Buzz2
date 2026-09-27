import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import prisma from "./lib/prisma";
import { getRoomWithPost } from "./services/chat.service";

const JWT_SECRET =
  process.env.JWT_SECRET || "default_jwt_secret_dev";

  let socketServer: Server | null = null;

  export function emitNewChatMessage(
    roomId: string,
    message: unknown,
  ) {
    socketServer
      ?.to(roomId)
      .emit("new-message", message);
  }

interface SocketUser {
  userId: string;
  role: string;
}

interface AuthenticatedSocket {
  user: SocketUser;
}

function verifyToken(token: string): SocketUser {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    typeof decoded.userId !== "string" ||
    typeof decoded.role !== "string"
  ) {
    throw new Error("Invalid token");
  }

  return {
    userId: decoded.userId,
    role: decoded.role,
  };
}

export function registerSocketServer(
  io: Server,
) {
  socketServer = io;
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token;

      if (
        typeof token !== "string" ||
        !token
      ) {
        next(
          new Error(
            "Authentication required",
          ),
        );
        return;
      }

      const user = verifyToken(token);

      (
        socket as typeof socket & {
          user: SocketUser;
        }
      ).user = user;

      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const authenticatedSocket =
      socket as typeof socket & AuthenticatedSocket;

    console.log(
      `Socket connected: ${authenticatedSocket.user.userId}`,
    );

    socket.on(
      "join-room",
      async (roomId: string, callback?: (result: unknown) => void) => {
        try {
          if (
            typeof roomId !== "string" ||
            !roomId
          ) {
            callback?.({
              ok: false,
              message: "Invalid room ID",
            });
            return;
          }

          const room =
            await getRoomWithPost(roomId);

          if (!room) {
            callback?.({
              ok: false,
              message: "Chat room not found",
            });
            return;
          }

          if (
            room.status === "CLOSED" ||
            room.post.status === "CLOSED" ||
            (
              room.post.expiresAt !== null &&
              room.post.expiresAt.getTime() <=
                Date.now()
            )
          ) {
            callback?.({
              ok: false,
              message: "This chat room is closed",
            });
            return;
          }

          const member =
            await prisma.chatMember.findUnique({
              where: {
                chatRoomId_userId: {
                  chatRoomId: roomId,
                  userId:
                    authenticatedSocket.user.userId,
                },
              },
            });

          if (
            !member ||
            member.leftAt !== null
          ) {
            callback?.({
              ok: false,
              message:
                "You must join the room first",
            });
            return;
          }

          socket.join(roomId);

          callback?.({
            ok: true,
          });

          socket.to(roomId).emit(
            "room-member-joined",
            {
              userId:
                authenticatedSocket.user.userId,
            },
          );
        } catch (error) {
          console.error(
            "Socket join-room failed:",
            error,
          );

          callback?.({
            ok: false,
            message:
              "Failed to join chat room",
          });
        }
      },
    );

    socket.on(
      "leave-room",
      (roomId: string) => {
        if (
          typeof roomId !== "string" ||
          !roomId
        ) {
          return;
        }

        socket.leave(roomId);

        socket.to(roomId).emit(
          "room-member-left",
          {
            userId:
              authenticatedSocket.user.userId,
          },
        );
      },
    );

    socket.on(
      "disconnect",
      () => {
        console.log(
          `Socket disconnected: ${authenticatedSocket.user.userId}`,
        );
      },
    );
  });
}