import prisma from "../lib/prisma";
import type { SendMessageInput } from "../validators/chat.validators";
import { createNotification } from "./notification.service";

export async function getRoomWithPost(roomId: string) {
  return prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: {
      post: {
        select: {
          id: true,
          authorId: true,
          interactionType: true,
          status: true,
          expiresAt: true,
        },
      },
    },
  });
}

function isRoomExpired(room: {
  post: {
    expiresAt: Date | null;
  };
}) {
  return (
    room.post.expiresAt !== null &&
    room.post.expiresAt.getTime() <= Date.now()
  );
}

export async function getChatRoomByPostId(
  postId: string,
  userId: string,
) {
  const room = await prisma.chatRoom.findUnique({
    where: {
      postId,
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          interactionType: true,
          expiresAt: true,
          status: true,
          authorId: true,
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      members: {
        where: {
          leftAt: null,
        },
        select: {
          userId: true,
        },
      },
    },
  });

  if (!room) {
    return null;
  }

  const expired = isRoomExpired(room);

  const isMember = room.members.some(
    (member) => member.userId === userId,
  );

  return {
    id: room.id,
    postId: room.postId,
    status:
      expired || room.post.status === "CLOSED"
        ? "CLOSED"
        : room.status,
    createdAt: room.createdAt,
    closedAt: room.closedAt,
    post: room.post,
    memberCount: room.members.length,
    isMember,
    isCreator: room.post.authorId === userId,
  };
}

export async function joinChatRoom(
  roomId: string,
  userId: string,
) {
  const room = await getRoomWithPost(roomId);

  if (!room) {
    throw new Error("Chat room not found");
  }

  if (
    room.status === "CLOSED" ||
    room.post.status === "CLOSED" ||
    isRoomExpired(room)
  ) {
    throw new Error("This chat room is closed");
  }

  const existingMember =
    await prisma.chatMember.findUnique({
      where: {
        chatRoomId_userId: {
          chatRoomId: roomId,
          userId,
        },
      },
    });

  if (existingMember) {
    if (existingMember.leftAt === null) {
      return existingMember;
    }

    return prisma.chatMember.update({
      where: {
        id: existingMember.id,
      },
      data: {
        joinedAt: new Date(),
        leftAt: null,
      },
    });
  }

  const member = await prisma.chatMember.create({
  data: {
    chatRoomId: roomId,
    userId,
  },
});

if (room.post.authorId !== userId) {
  await createNotification({
    userId: room.post.authorId,
    type: "PARTICIPANT_JOINED",
    title: "Someone joined your coordination room",
    description: "A student joined your post's chat room.",
    link: `/buzz/${room.post.id}`,
  });
}
return member;
}

export async function leaveChatRoom(
  roomId: string,
  userId: string,
) {
  const member =
    await prisma.chatMember.findUnique({
      where: {
        chatRoomId_userId: {
          chatRoomId: roomId,
          userId,
        },
      },
    });

  if (!member || member.leftAt !== null) {
    throw new Error("You are not a member of this room");
  }

  return prisma.chatMember.update({
    where: {
      id: member.id,
    },
    data: {
      leftAt: new Date(),
    },
  });
}

export async function getMessages(
  roomId: string,
  userId: string,
) {
  const member =
    await prisma.chatMember.findUnique({
      where: {
        chatRoomId_userId: {
          chatRoomId: roomId,
          userId,
        },
      },
    });

  if (!member || member.leftAt !== null) {
    throw new Error("You must join the room first");
  }

  return prisma.message.findMany({
    where: {
      chatRoomId: roomId,
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function sendMessage(
  roomId: string,
  userId: string,
  data: SendMessageInput,
) {
  const room = await getRoomWithPost(roomId);

  if (!room) {
    throw new Error("Chat room not found");
  }

  if (
    room.status === "CLOSED" ||
    room.post.status === "CLOSED" ||
    isRoomExpired(room)
  ) {
    throw new Error("This chat room is closed");
  }

  const member =
    await prisma.chatMember.findUnique({
      where: {
        chatRoomId_userId: {
          chatRoomId: roomId,
          userId,
        },
      },
    });

  if (!member || member.leftAt !== null) {
    throw new Error("You must join the room first");
  }

  return prisma.message.create({
    data: {
      chatRoomId: roomId,
      userId,
      content: data.content,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function closeChatRoom(
  roomId: string,
  userId: string,
) {
  const room = await getRoomWithPost(roomId);

  if (!room) {
    throw new Error("Chat room not found");
  }

  if (room.post.authorId !== userId) {
    throw new Error(
      "Only the post creator can close this room",
    );
  }

  if (room.status === "CLOSED") {
    return room;
  }

  return prisma.chatRoom.update({
    where: {
      id: roomId,
    },
    data: {
      status: "CLOSED",
      closedAt: new Date(),
    },
  });
}

export async function getActiveRoomMemberIds(
  roomId: string,
) {
  const members = await prisma.chatMember.findMany({
    where: {
      chatRoomId: roomId,
      leftAt: null,
    },
    select: {
      userId: true,
    },
  });

  return members.map((member) => member.userId);
}