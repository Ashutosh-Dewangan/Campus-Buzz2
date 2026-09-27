"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  getSession,
  useCurrentUser,
} from "@/lib/session";
import type { Socket } from "socket.io-client";
import { createChatSocket } from "@/lib/socket";
import {
  closeChatRoom,
  getChatMessages,
  getChatRoomByPost,
  joinChatRoom,
  leaveChatRoom,
  sendChatMessage,
  type ChatMessage,
  type ChatRoom as ApiChatRoom,
} from "@/lib/api";
import MessageBubble from "./MessageBubble";

interface ChatRoomProps {
  postId: string;
  roomName?: string;
  roomType?: string;
}

function InlineConfirm({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="comic-card"
        style={{
          padding: "20px 24px",
          maxWidth: 320,
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 13,
            color: "var(--fg)",
            marginBottom: 16,
          }}
        >
          {message}
        </p>

        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            className="comic-btn-outline"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="comic-btn"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatRoom({
  postId,
  roomName = "Food Split",
  roomType = "#foodsplit",
}: ChatRoomProps) {
  const [room, setRoom] =
    useState<ApiChatRoom | null>(null);

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [joining, setJoining] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [pendingConfirm, setPendingConfirm] =
    useState<null | "close" | "leave">(null);

  const currentUser = useCurrentUser();

  const messagesEndRef =
    useRef<HTMLDivElement>(null);

  const socketRef =
    useRef<Socket | null>(null);

  async function loadRoom() {
    setLoading(true);
    setError(null);

    try {
      const roomData =
        await getChatRoomByPost(postId);

      setRoom(roomData);

      if (roomData.isMember) {
        const messageData =
          await getChatMessages(roomData.id);

        setMessages(messageData);
      } else {
        setMessages([]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load chat room"
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Initial room loading.
   *
   * The async boundary prevents the React lint rule from
   * treating the effect body as an immediate synchronous
   * state update.
   */
  useEffect(() => {
    let cancelled = false;

    async function initializeRoom() {
      setLoading(true);
      setError(null);

      try {
        const roomData =
          await getChatRoomByPost(postId);

        if (cancelled) {
          return;
        }

        setRoom(roomData);

        if (roomData.isMember) {
          const messageData =
            await getChatMessages(roomData.id);

          if (cancelled) {
            return;
          }

          setMessages(messageData);
        } else {
          setMessages([]);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load chat room"
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initializeRoom();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  /*
   * Socket connection.
   *
   * Only establish a realtime connection when the user is
   * actually a member of an open room.
   */
  useEffect(() => {
    const currentRoom = room;

    if (
      !currentRoom ||
      !currentRoom.isMember ||
      currentRoom.status !== "OPEN"
    ) {
      return;
    }

    const session = getSession();

    if (!session?.token) {
      return;
    }

    const socket = createChatSocket(
      session.token
    );

    socketRef.current = socket;

    function handleNewMessage(
      message: ChatMessage
    ) {
      setMessages((current) => {
        if (
          current.some(
            (item) => item.id === message.id
          )
        ) {
          return current;
        }

        return [...current, message];
      });
    }

    socket.on(
      "connect",
      () => {
        socket.emit(
          "join-room",
          currentRoom.id,
          (result: {
            ok: boolean;
            message?: string;
          }) => {
            if (!result.ok) {
              setError(
                result.message ||
                  "Unable to connect to chat room"
              );
            }
          }
        );
      }
    );

    socket.on(
      "new-message",
      handleNewMessage
    );

    socket.on(
      "connect_error",
      () => {
        setError(
          "Real-time chat connection unavailable. Messages can still be refreshed."
        );
      }
    );

    socket.connect();

    return () => {
      socket.emit(
        "leave-room",
        currentRoom.id
      );

      socket.off(
        "new-message",
        handleNewMessage
      );

      socket.disconnect();

      socketRef.current = null;
    };
  }, [
    room,
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function handleJoin() {
    if (!room || joining) {
      return;
    }

    setJoining(true);
    setError(null);

    try {
      await joinChatRoom(room.id);
      await loadRoom();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to join room"
      );
    } finally {
      setJoining(false);
    }
  }

  const handleSendMessage = async () => {
    if (
      !room ||
      !input.trim() ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);
      setError("");

      await sendChatMessage(
        room.id,
        input.trim()
      );

      setInput("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send message"
      );
    } finally {
      setSending(false);
    }
  };

  async function handleLeaveRoom() {
    if (!room) {
      return;
    }

    setError(null);

    try {
      await leaveChatRoom(room.id);

      setRoom((current) =>
        current
          ? {
              ...current,
              isMember: false,
              memberCount: Math.max(
                0,
                current.memberCount - 1
              ),
            }
          : current
      );

      setMessages([]);
      setPendingConfirm(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to leave room"
      );
    }
  }

  async function handleCloseRoom() {
    if (!room) {
      return;
    }

    setError(null);

    try {
      const closedRoom =
        await closeChatRoom(room.id);

      setRoom((current) =>
        current
          ? {
              ...current,
              status: closedRoom.status,
              closedAt: closedRoom.closedAt,
            }
          : closedRoom
      );

      setPendingConfirm(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to close room"
      );
    }
  }

  if (loading) {
    return (
      <div className="flex h-[600px] items-center justify-center comic-card">
        <p
          className="text-sm"
          style={{ color: "var(--fg-muted)" }}
        >
          Loading room...
        </p>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="flex h-[600px] flex-col items-center justify-center comic-card p-8 text-center">
        <h2 className="stay-loop-title">
          Unable to load room
        </h2>

        <p className="comic-sub mt-2 max-w-sm">
          {error}
        </p>

        <button
          type="button"
          onClick={() => void loadRoom()}
          className="comic-btn mt-5"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!room) {
    return null;
  }

  const roomClosed =
    room.status === "CLOSED" ||
    room.post.status === "CLOSED";

  const isCreator = room.isCreator;
  const isMember = room.isMember;

  if (!isMember) {
    return (
      <div className="relative flex h-[600px] flex-col overflow-hidden comic-card">
        <div
          className="border-b p-5"
          style={{ borderColor: "#000" }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              {roomType}
            </span>

            {roomClosed ? (
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                Closed
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Live
              </span>
            )}
          </div>

          <h1
            className="stay-loop-title mt-3 truncate"
            style={{ fontSize: 24 }}
          >
            {roomName}
          </h1>

          <div
            className="mt-1 flex items-center gap-1.5 text-sm"
            style={{ color: "var(--fg-muted)" }}
          >
            <span>👥</span>

            <span>
              {room.memberCount}{" "}
              {room.memberCount === 1
                ? "member"
                : "members"}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <h2 className="stay-loop-title">
            Join this room
          </h2>

          <p className="comic-sub mt-2 max-w-sm">
            Join the conversation to coordinate with other students.
          </p>

          {error && (
            <p className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => void handleJoin()}
            disabled={
              roomClosed || joining
            }
            className="comic-btn mt-5 disabled:opacity-40"
          >
            {joining
              ? "Joining..."
              : "Join Room"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-[600px] flex-col overflow-hidden comic-card">
      {pendingConfirm === "close" && (
        <InlineConfirm
          message="Close this room? Members will no longer be able to send messages."
          onConfirm={() =>
            void handleCloseRoom()
          }
          onCancel={() =>
            setPendingConfirm(null)
          }
        />
      )}

      {pendingConfirm === "leave" && (
        <InlineConfirm
          message="Leave this room? You can rejoin from the Campus Buzz feed."
          onConfirm={() =>
            void handleLeaveRoom()
          }
          onCancel={() =>
            setPendingConfirm(null)
          }
        />
      )}

      <div
        className="border-b p-5"
        style={{ borderColor: "#000" }}
      >
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

            <h1
              className="stay-loop-title mt-3 truncate"
              style={{ fontSize: 24 }}
            >
              {roomName}
            </h1>

            <div
              className="mt-1 flex items-center gap-1.5 text-sm"
              style={{ color: "var(--fg-muted)" }}
            >
              <span>👥</span>

              <span>
                {room.memberCount}{" "}
                {room.memberCount === 1
                  ? "member"
                  : "members"}
              </span>
            </div>
          </div>

          <div className="shrink-0">
            {isCreator ? (
              !roomClosed ? (
                <button
                  type="button"
                  onClick={() =>
                    setPendingConfirm("close")
                  }
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
              !roomClosed && (
                <button
                  type="button"
                  onClick={() =>
                    setPendingConfirm("leave")
                  }
                  className="comic-btn-outline"
                >
                  Leave Room
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div
        className="flex-1 space-y-4 overflow-y-auto p-5"
        style={{
          background: "rgba(0,0,0,0.25)",
        }}
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p
              className="text-sm"
              style={{ color: "var(--fg-muted)" }}
            >
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              user={message.user.name}
              message={message.content}
              timestamp={formatTime(
                message.createdAt
              )}
              isCurrentUser={
                message.userId ===
                currentUser?.id
              }
            />
          ))
        )}

        {roomClosed && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-center text-sm font-medium text-red-700">
            This room has been closed. New messages are disabled.
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {!roomClosed ? (
        <div
          className="border-t p-4"
          style={{ borderColor: "#000" }}
        >
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();
                  void handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              className="comic-input flex-1 px-4 py-3 text-sm outline-none"
              aria-label="Message input"
              disabled={sending}
            />

            <button
              type="button"
              onClick={() =>
                void handleSendMessage()
              }
              disabled={
                !input.trim() || sending
              }
              className="comic-btn disabled:opacity-40"
            >
              {sending
                ? "Sending..."
                : "Send"}
            </button>
          </div>

          <p
            className="mt-2 px-1 text-[11px]"
            style={{
              color: "var(--fg-muted)",
            }}
          >
            Press Enter to send · Messages are saved to the chat room
          </p>
        </div>
      ) : (
        <div
          className="border-t p-4 text-center text-sm"
          style={{
            borderColor: "#000",
            color: "var(--fg-muted)",
          }}
        >
          Messaging is disabled — this room is closed.
        </div>
      )}
    </div>
  );
}