"use client";

import { useEffect, useRef, useState } from "react";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

const initialNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "New room message",
    description: "Someone replied in Food Split.",
    time: "2m ago",
    unread: true,
  },
  {
    id: "2",
    title: "Event reminder",
    description: "Tech Fest starts tomorrow.",
    time: "1h ago",
    unread: true,
  },
  {
    id: "3",
    title: "Complaint resolved",
    description: "Your hostel Wi-Fi issue has been marked resolved.",
    time: "3h ago",
    unread: false,
  },
  {
    id: "4",
    title: "Post expiring soon",
    description: "Your food split post expires in 30 minutes.",
    time: "5h ago",
    unread: false,
  },
];

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  function markAllAsRead() {
    setNotifications((current) =>
      current.map((item) => ({ ...item, unread: false }))
    );
  }

  function toggleNotificationRead(id: string) {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, unread: !item.unread } : item
      )
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Campus notifications"
        aria-expanded={isOpen}
        className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
      >
        <span className="text-lg" aria-hidden="true">
          🔔
        </span>

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-900">Notifications</h2>
              {unreadCount > 0 && (
                <span className="rounded-full bg-black px-2 py-0.5 text-[11px] font-semibold text-white">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="cursor-pointer text-xs font-semibold text-gray-500 hover:text-black focus:outline-none"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="mt-2 divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleNotificationRead(item.id)}
                className={`flex cursor-pointer items-start justify-between gap-3 py-3 transition hover:bg-gray-50 px-2 rounded-xl ${
                  item.unread ? "bg-gray-50/60" : ""
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm ${
                        item.unread
                          ? "font-semibold text-gray-900"
                          : "font-medium text-gray-700"
                      }`}
                    >
                      {item.title}
                    </p>
                    {item.unread && (
                      <span className="h-2 w-2 rounded-full bg-blue-600" />
                    )}
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed">
                    {item.description}
                  </p>

                  <p className="text-[10px] text-gray-400">{item.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 border-t pt-2 text-center">
            <p className="text-[11px] text-gray-400">
              Campus Buzz activity notifications
            </p>
          </div>
        </div>
      )}
    </div>
  );
}