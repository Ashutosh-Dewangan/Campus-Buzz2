"use client";

import { useState } from "react";
import MessageBubble from "./MessageBubble";

interface Message {
  id: string;
  user: string;
  message: string;
}

const initialMessages: Message[] = [
  {
    id: "1",
    user: "Rahul",
    message: "Anyone ordering pizza?",
  },
  {
    id: "2",
    user: "Priya",
    message: "Yes, I'm in!",
  },
];

interface ChatRoomProps {
  roomName?: string;
  isCreator?: boolean;
}

export default function ChatRoom({
  roomName = "Food Split",
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
      },
    ]);

    setInput("");
  }

  if (hasLeft) {
    return (
      <div className="flex h-[600px] flex-col items-center justify-center rounded-2xl border bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">You left this room</h2>
        <p className="mt-2 text-sm text-gray-500">You can rejoin the discussion from the Campus Buzz feed.</p>
        <button
          onClick={() => setHasLeft(false)}
          className="mt-5 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition cursor-pointer"
        >
          Rejoin Room
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] flex-col rounded-2xl border bg-white shadow-sm overflow-hidden">
      {/* Room Header */}
      <div className="flex items-center justify-between border-b p-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {roomName}
          </h1>

          <p className="text-sm text-green-600 font-medium flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
            Live
          </p>
        </div>

        {/* Room Lifecycle Actions (Stage 7) */}
        <div className="flex items-center gap-2">
          {isCreator ? (
            !roomClosed ? (
              <button
                onClick={() => setRoomClosed(true)}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 cursor-pointer"
              >
                Close Room
              </button>
            ) : (
              <button
                onClick={() => setRoomClosed(false)}
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black cursor-pointer"
              >
                Reopen Room
              </button>
            )
          ) : (
            <button
              onClick={() => setHasLeft(true)}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 cursor-pointer"
            >
              Leave Room
            </button>
          )}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            user={message.user}
            message={message.message}
            isCurrentUser={message.user === "You"}
          />
        ))}

        {/* Closed Room Banner (Stage 7) */}
        {roomClosed && (
          <div className="p-4 text-center rounded-xl bg-red-50 text-red-700 font-medium text-sm border border-red-100 mt-4">
            This room has been closed.
          </div>
        )}
      </div>

      {/* Input / Control Footer */}
      {!roomClosed ? (
        <div className="flex gap-2 border-t p-4 bg-gray-50">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Type a message..."
            className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
          />

          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="rounded-xl bg-black px-5 font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
          >
            Send
          </button>
        </div>
      ) : (
        <div className="border-t p-4 text-center text-sm text-gray-500 bg-gray-50">
          Messaging is disabled because this room is closed.
        </div>
      )}
    </div>
  );
}
