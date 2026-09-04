"use client";

import { useState } from "react";
import MessageBubble from "./MessageBubble";

interface Message {
  id: string;
  user: string;
  message: string;
  timestamp: string;
}

const initialMessages: Message[] = [
  {
    id: "1",
    user: "Rahul",
    message: "Anyone ordering pizza?",
    timestamp: "6:42 PM",
  },
  {
    id: "2",
    user: "Priya",
    message: "Yes, I'm in!",
    timestamp: "6:43 PM",
  },
];

interface ChatRoomProps {
  roomName?: string;
  roomType?: string;
  memberCount?: number;
  isCreator?: boolean;
}

export default function ChatRoom({
  roomName = "Food Split",
  roomType = "#foodsplit",
  memberCount = 4,
  isCreator = true,
}: ChatRoomProps) {
  const [messages, setMessages] =
    useState<Message[]>(initialMessages);

  const [input, setInput] = useState("");
  const [roomClosed, setRoomClosed] = useState(false);
  const [hasLeft, setHasLeft] = useState(false);

  function sendMessage() {
    if (!input.trim() || roomClosed || hasLeft) return;

    setMessages((current) => [
      ...current,
      {
        id: Date.now().toString(),
        user: "You",
        message: input.trim(),
        timestamp: "Just now",
      },
    ]);

    setInput("");
  }

  function handleCloseRoom() {
    const confirmed = window.confirm(
      "Are you sure you want to close this room? Members will no longer be able to send messages."
    );

    if (confirmed) {
      setRoomClosed(true);
    }
  }

  function handleLeaveRoom() {
    const confirmed = window.confirm(
      "Are you sure you want to leave this room?"
    );

    if (confirmed) {
      setHasLeft(true);
    }
  }

  if (hasLeft) {
    return (
      <div className="flex h-[600px] flex-col items-center justify-center comic-card p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
          🚪
        </div>

        <h2 className="stay-loop-title mt-4">
          You left this room
        </h2>

        <p className="comic-sub mt-2 max-w-sm">
          You can return to the Campus Buzz feed and join the
          conversation again whenever you want.
        </p>

        <button
          type="button"
          onClick={() => setHasLeft(false)}
          className="comic-btn mt-5"
        >
          Rejoin Room
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] flex-col overflow-hidden comic-card">

      {/* Room Header */}
      <div className="border-b p-5" style={{ borderColor: "#000" }}>
        <div className="flex items-start justify-between gap-4">

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                {roomType}
              </span>

              {!roomClosed ? (
                <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Live
                </span>
              ) : (
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                  Closed
                </span>
              )}
            </div>

            <h1 className="stay-loop-title mt-3 truncate" style={{ fontSize: 24 }}>
              {roomName}
            </h1>

            <div className="mt-1 flex items-center gap-1.5 text-sm" style={{ color: "var(--fg-muted)" }}>
              <span>👥</span>
              <span>
                {memberCount}{" "}
                {memberCount === 1 ? "member" : "members"}
              </span>
            </div>
          </div>

          {/* Room Actions */}
          <div className="shrink-0">
            {isCreator ? (
              !roomClosed ? (
                <button
                  type="button"
                  onClick={handleCloseRoom}
                  className="comic-btn"
                >
                  Close Room
                </button>
              ) : (
                <span className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-500">
                  Room Closed
                </span>
              )
            ) : (
              <button
                type="button"
                onClick={handleLeaveRoom}
                className="comic-btn-outline"
              >
                Leave Room
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ background: "rgba(0,0,0,0.25)" }}>
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-400">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              user={message.user}
              message={message.message}
              timestamp={message.timestamp}
              isCurrentUser={message.user === "You"}
            />
          ))
        )}

        {roomClosed && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-center text-sm font-medium text-red-700">
            This room has been closed. New messages are disabled.
          </div>
        )}
      </div>

      {/* Message Input */}
      {!roomClosed ? (
        <div className="border-t p-4" style={{ borderColor: "#000" }}>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              placeholder="Type a message..."
              className="comic-input flex-1 px-4 py-3 text-sm outline-none"
            />

            <button
              type="button"
              onClick={sendMessage}
              disabled={!input.trim()}
              className="comic-btn disabled:opacity-40"
            >
              Send
            </button>
          </div>

          <p className="mt-2 px-1 text-[11px] text-gray-400">
            Press Enter to send
          </p>
        </div>
      ) : (
        <div className="border-t bg-white p-4 text-center text-sm text-gray-400">
          Messaging is disabled because this room is closed.
        </div>
      )}
    </div>
  );
}