import prisma from "../lib/prisma";
import { emitNotification } from "../socket";

export type CreateNotificationInput = {
  userId: string;
  type:
    | "ROOM_MESSAGE"
    | "PARTICIPANT_JOINED"
    | "EXPIRY_APPROACHING"
    | "EVENT_ALERT"
    | "COMPLAINT_RESOLVED";
  title: string;
  description: string;
  link?: string;
};

function formatNotification(notification: {
  id: string;
  type:
    | "ROOM_MESSAGE"
    | "PARTICIPANT_JOINED"
    | "EXPIRY_APPROACHING"
    | "EVENT_ALERT"
    | "COMPLAINT_RESOLVED";
  title: string;
  description: string;
  link: string | null;
  readAt: Date | null;
  createdAt: Date;
}) {
  return {
    id: notification.id,
    type: notification.type.toLowerCase() as
      | "room_message"
      | "participant_joined"
      | "expiry_approaching"
      | "event_alert"
      | "complaint_resolved",
    title: notification.title,
    description: notification.description,
    link: notification.link,
    unread: notification.readAt === null,
    time: formatRelativeTime(notification.createdAt),
    createdAt: notification.createdAt,
  };
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) {
    return "Just now";
  }

  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export async function createNotification(
  input: CreateNotificationInput,
) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      description: input.description,
      link: input.link,
    },
  });
  const formattedNotification =
  formatNotification(notification);
  emitNotification(
  input.userId,
  formattedNotification,
  );
  return formattedNotification;
}

export async function getUserNotifications(userId: string) {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return notifications.map(formatNotification);
}

export async function markNotificationRead(
  userId: string,
  notificationId: string,
) {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  const updated = await prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      readAt: notification.readAt ?? new Date(),
    },
  });

  return formatNotification(updated);
}

export async function markAllNotificationsRead(
  userId: string,
) {
  await prisma.notification.updateMany({
    where: {
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  return getUserNotifications(userId);
}