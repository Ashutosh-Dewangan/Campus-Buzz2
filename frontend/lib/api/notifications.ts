import { NotificationItem } from "@/types";
import { getStoredNotifications, saveStoredNotifications } from "./storage";

export async function getNotifications(): Promise<NotificationItem[]> {
  return getStoredNotifications();
}

export async function markNotificationRead(id: string): Promise<NotificationItem[]> {
  const current = getStoredNotifications();
  const updated = current.map((item) =>
    item.id === id ? { ...item, unread: !item.unread } : item
  );
  saveStoredNotifications(updated);
  return updated;
}

export async function markAllNotificationsRead(): Promise<NotificationItem[]> {
  const current = getStoredNotifications();
  const updated = current.map((item) => ({ ...item, unread: false }));
  saveStoredNotifications(updated);
  return updated;
}

export async function addNotification(
  notif: Omit<NotificationItem, "id" | "time" | "unread">
): Promise<NotificationItem> {
  const current = getStoredNotifications();
  const newItem: NotificationItem = {
    id: `notif-${Date.now()}`,
    time: "Just now",
    unread: true,
    ...notif,
  };
  saveStoredNotifications([newItem, ...current]);
  return newItem;
}
