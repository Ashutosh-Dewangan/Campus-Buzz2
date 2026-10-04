"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications";
import { NotificationItem } from "@/types";
import { getSession } from "@/lib/session";
import { createChatSocket } from "@/lib/socket";
import { BellIcon } from "@/components/ui/Icons";

export default function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
  let socket: ReturnType<typeof createChatSocket> | null =
    null;

  async function load() {
    try {
      const items = await getNotifications();
      setNotifications(items);
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error,
      );
    }
  }

  load();

  const session = getSession();

  if (!session?.token) {
    return;
  }

  socket = createChatSocket(session.token);

  socket.on(
    "notification",
    (notification: NotificationItem) => {
      setNotifications((current) => {
        const withoutDuplicate = current.filter(
          (item) => item.id !== notification.id,
        );

        return [
          notification,
          ...withoutDuplicate,
        ];
      });
    },
  );

  socket.on("connect_error", (error) => {
    console.error(
      "Notification socket connection failed:",
      error,
    );
  });

  socket.connect();

  return () => {
    socket?.off("notification");
    socket?.off("connect_error");
    socket?.disconnect();
  };
}, []);

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

 async function handleMarkAllAsRead() {
  try {
    const updated =
      await markAllNotificationsRead();

    setNotifications(updated);
  } catch (error) {
    console.error(
      "Failed to mark notifications as read:",
      error,
    );
  }
}
  async function handleItemClick(
  item: NotificationItem,
) {
  try {
    if (item.unread) {
      const updated =
        await markNotificationRead(item.id);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === updated.id
            ? updated
            : notification,
        ),
      );
    }

    setIsOpen(false);

    if (item.link) {
      router.push(item.link);
    }
  } catch (error) {
    console.error(
      "Failed to mark notification as read:",
      error,
    );
  }
}

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Campus alerts"
        aria-expanded={isOpen}
        className="relative flex h-9 w-9 min-h-[36px] min-w-[36px] cursor-pointer items-center justify-center rounded-sm border-2 border-black bg-[var(--accent)] text-white shadow-[2px_2px_0_#000] hover:bg-[var(--accent-hover)] transition"
      >
        <BellIcon className="h-4 w-4" />

        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-black bg-[var(--neon-cyan)] px-1 text-[9px] font-black text-black shadow-[1px_1px_0_#000]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="cb-notification-dropdown comic-modal absolute right-0 top-11 z-50 rounded-sm p-0 shadow-[6px_6px_0_#000]">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-white">
                Campus Alerts
              </h2>
              {unreadCount > 0 && (
                <span className="rounded-sm border border-black bg-[var(--accent)] px-1.5 py-0.2 text-[9px] font-black text-white">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="cursor-pointer text-[10px] font-bold text-[var(--neon-cyan)] hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="mt-3 space-y-2 max-h-80 overflow-y-auto pr-0.5">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--fg-muted)]">
                No notifications right now.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`flex cursor-pointer items-start justify-between gap-3 p-3 transition rounded-sm ${
                    item.unread
                      ? "border-2 border-black border-l-4 border-l-[var(--neon-cyan)] bg-[rgba(26,18,52,0.95)] shadow-[2px_2px_0_#000] hover:bg-[rgba(32,22,64,0.98)]"
                      : "border border-black/40 bg-[rgba(10,8,22,0.6)] opacity-80 hover:opacity-100 hover:bg-[rgba(18,14,36,0.85)]"
                  }`}
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-xs ${
                          item.unread
                            ? "font-black text-white"
                            : "font-bold text-[var(--fg)]"
                        }`}
                      >
                        {item.title}
                      </p>
                      {item.unread && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)] shrink-0 shadow-[0_0_4px_#2af0ff]" />
                      )}
                    </div>

                    <p className="font-readable text-xs text-[var(--fg-muted)] leading-relaxed">
                      {item.description}
                    </p>

                    <p className="text-[10px] text-[var(--fg-muted)] pt-0.5">
                      {item.time}
                    </p>
                  </div>

                  {item.link && (
                    <span className="text-xs text-[var(--neon-cyan)] shrink-0 self-center">
                      ↗
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          <div className="mt-3 border-t border-black/40 pt-2 text-center text-[10px] text-[var(--fg-muted)]">
            Verified real-time alerts
          </div>
        </div>
      )}
    </div>
  );
}