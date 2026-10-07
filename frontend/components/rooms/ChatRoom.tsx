"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCurrentUser, getSession } from "@/lib/session";

import { createChatSocket } from "@/lib/socket";
import {
  closeChatRoom,
  getChatMessages,
  getChatRoomByPost,
  joinChatRoom,
  leaveChatRoom,
  sendChatMessage,
  makeNegotiationOffer,
  updateOfferStatus,
  type ChatMessage,
  type ChatRoomData,
} from "@/lib/api/rooms";
import MessageBubble from "./MessageBubble";
import { ResellOffer } from "@/types";
import {
  UsersIcon,
  ClockIcon,
  LockIcon,
  PinIcon,
  UtensilsIcon,
  CarIcon,
  TagIcon,
  CheckIcon,
  XIcon,
  RefreshIcon,
  StarIcon,
} from "@/components/ui/Icons";

interface ChatRoomProps {
  postId: string;
  roomName?: string;
  roomType?: string;
}

function formatTime(timestamp: string) {
  try {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Just now";
  }
}

export default function ChatRoom({
  postId,
  roomName = "Coordination Room",
  roomType = "#foodsplit",
}: ChatRoomProps) {
  const [room, setRoom] = useState<ChatRoomData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showParticipants, setShowParticipants] = useState(false);

  // Resell Offer modal state
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");

  // Food split calculator state
  const [billTotal, setBillTotal] = useState<number>(600);
  const [splitCount, setSplitCount] = useState<number>(3);

  // Close/Leave confirmation modal
  const [pendingConfirm, setPendingConfirm] = useState<null | "close" | "leave">(null);

  const currentUser = useCurrentUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function loadRoom() {
    try {
      setLoading(true);
      setError(null);
      const roomData = await getChatRoomByPost(postId);
      setRoom(roomData);

      if (roomData.post.orderTotal) setBillTotal(roomData.post.orderTotal);
      if (roomData.post.splitCount) setSplitCount(roomData.post.splitCount);

      if (roomData.isMember) {
        const msgData = await getChatMessages(roomData.id);
        setMessages(msgData);
      } else {
        setMessages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load room");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        setLoading(true);
        setError(null);
        const roomData = await getChatRoomByPost(postId);
        if (ignore) return;
        setRoom(roomData);

        if (roomData.post.orderTotal) setBillTotal(roomData.post.orderTotal);
        if (roomData.post.splitCount) setSplitCount(roomData.post.splitCount);

        if (roomData.isMember) {
          const msgData = await getChatMessages(roomData.id);
          if (ignore) return;
          setMessages(msgData);
        } else {
          setMessages([]);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load room");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    init();
    return () => {
      ignore = true;
    };
  }, [postId]);

  // Socket.IO real-time message and member coordination
  useEffect(() => {
    let socket: ReturnType<typeof createChatSocket> | null = null;
    const session = getSession();

    if (!room || !room.id || !session?.token) {
      return;
    }

    if (room.isMember && room.status === "OPEN") {
      try {
        socket = createChatSocket(session.token);

        socket.on("connect", () => {
          socket?.emit("join-room", room.id);
          // Refetch messages on connect or reconnect in case any were missed while offline
          void getChatMessages(room.id)
            .then((freshMsgs) => {
              setMessages((current) => {
                const merged = new Map(freshMsgs.map((message) => [message.id, message]));
                current.forEach((message) => {
                  if (!merged.has(message.id)) merged.set(message.id, message);
                });
                return [...merged.values()].sort(
                  (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
                );
              });
            })
            .catch(() => {});
        });

        socket.on("new-message", (incomingMsg: ChatMessage) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === incomingMsg.id)) return prev;
            return [...prev, incomingMsg];
          });
        });

        socket.on("room-member-joined", () => {
          void loadRoom();
        });

        socket.on("room-member-left", () => {
          void loadRoom();
        });

        socket.on("connect_error", (err) => {
          console.warn("Chat socket connect error:", err.message);
        });

        socket.connect();
      } catch (err) {
        console.warn("Failed to initialize chat socket:", err);
      }
    }

    return () => {
      if (socket) {
        if (room?.id) {
          socket.emit("leave-room", room.id);
        }
        socket.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id, room?.isMember, room?.status]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const isAnyModalOpen = Boolean(pendingConfirm || showOfferModal || showParticipants);
    if (!isAnyModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (pendingConfirm) setPendingConfirm(null);
        else if (showOfferModal) setShowOfferModal(false);
        else if (showParticipants) setShowParticipants(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pendingConfirm, showOfferModal, showParticipants]);

  async function handleJoin() {
    if (!room || joining) return;
    try {
      setJoining(true);
      await joinChatRoom(room.id);
      await loadRoom();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join room");
    } finally {
      setJoining(false);
    }
  }

  async function handleSendMessage() {
    if (!room || !input.trim() || sending || room.status === "CLOSED") return;
    const text = input.trim();
    setInput("");

    try {
      setSending(true);
      const newMsg = await sendChatMessage(room.id, text);
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  async function handleCloseRoom() {
    if (!room) return;
    try {
      const closed = await closeChatRoom(room.id);
      setRoom((cur) => (cur ? { ...cur, status: "CLOSED", closedAt: closed.closedAt } : null));
      setPendingConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to close room");
    }
  }

  async function handleLeaveRoom() {
    if (!room) return;
    try {
      await leaveChatRoom(room.id);
      setRoom((cur) =>
        cur
          ? {
              ...cur,
              isMember: false,
              memberCount: Math.max(0, cur.memberCount - 1),
            }
          : null
      );
      setPendingConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to leave room");
    }
  }

  async function handleMakeOffer() {
    if (!room || !offerAmount.trim()) return;
    const amount = parseInt(offerAmount.replace(/[^0-9]/g, ""), 10);
    if (isNaN(amount) || amount <= 0) return;

    try {
      await makeNegotiationOffer(room.id, amount);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Backend limitation: Resell offers are not supported by the current server contract. Please coordinate directly via chat."
      );
      setShowOfferModal(false);
      setOfferAmount("");
    }
  }

  async function handleAcceptOffer(offerId: string) {
    if (!room) return;
    try {
      await updateOfferStatus(room.id, offerId, "ACCEPTED");
      setRoom((cur) => {
        if (!cur) return null;
        const updatedOffers = cur.offers?.map((o) =>
          o.id === offerId ? ({ ...o, status: "ACCEPTED" as const } as ResellOffer) : o
        );
        return { ...cur, offers: updatedOffers, resellStatus: "RESERVED" };
      });
      await sendChatMessage(room.id, "Offer has been accepted! Item is now marked RESERVED.");
      const msgs = await getChatMessages(room.id);
      setMessages(msgs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept offer.");
    }
  }

  function handleShareSplitInChat() {
    const perPerson = Math.ceil(billTotal / Math.max(1, splitCount));
    const msg = `Food Split Calculation: Total ₹${billTotal} split among ${splitCount} members = ₹${perPerson} each. Please UPI before delivery!`;
    setInput(msg);
  }

  if (loading) {
    return (
      <div className="comic-card flex h-[580px] items-center justify-center p-8 text-center animate-pulse">
        <p className="text-sm font-bold text-[var(--neon-cyan)]">
          Connecting to campus coordination room...
        </p>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="comic-card flex h-[580px] flex-col items-center justify-center p-8 text-center">
        <h2 className="stay-loop-title">Unable to Load Room</h2>
        <p className="comic-sub mt-2">{error}</p>
        <button
          type="button"
          onClick={() => void loadRoom()}
          className="retro-btn inline-flex items-center gap-1.5 mt-5 cursor-pointer"
        >
          <RefreshIcon className="h-3.5 w-3.5 shrink-0" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  if (!room) return null;

  const roomClosed = room.status === "CLOSED" || room.post.status === "CLOSED";
  const isCreator = room.isCreator;
  const isMember = room.isMember;
  const calculatedPerPerson = Math.ceil(billTotal / Math.max(1, splitCount));

  return (
    <div className="relative flex flex-col md:flex-row gap-4">
      {/* ================= MAIN CHAT PANEL ================= */}
      <div className="comic-card relative flex flex-1 flex-col h-[650px] overflow-hidden">
        {/* Close/Leave Inline Confirmation Modal */}
        {pendingConfirm && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setPendingConfirm(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
          >
            <div
              className="comic-modal p-6 text-center max-w-sm rounded-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="confirm-dialog-title" className="text-sm font-black uppercase text-white mb-2">
                {pendingConfirm === "close" ? "Close Coordination Room?" : "Leave This Room?"}
              </h3>
              <p className="text-xs text-[var(--fg-muted)] mb-5 font-readable leading-relaxed">
                {pendingConfirm === "close"
                  ? "Closing the room will disable messaging for all members. Existing messages will be preserved."
                  : "You can rejoin later from the Campus Buzz feed or Rooms list."}
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => setPendingConfirm(null)}
                  className="retro-btn-outline text-xs min-h-[38px] px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    pendingConfirm === "close"
                      ? void handleCloseRoom()
                      : void handleLeaveRoom()
                  }
                  className="retro-btn text-xs font-black min-h-[38px] px-4 cursor-pointer"
                >
                  {pendingConfirm === "close" ? "Confirm Close" : "Confirm Leave"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Room Header */}
        <div className="border-b-3 border-black bg-[rgba(14,10,32,0.95)] p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-sm border-2 border-black bg-black/60 px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase text-[var(--neon-cyan)] shadow-[1px_1px_0_#000]">
                  {roomType}
                </span>

                {roomClosed ? (
                  <span className="inline-flex items-center gap-1 rounded-sm border-2 border-black bg-red-950/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[var(--accent)] shadow-[1px_1px_0_#000]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                    Closed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-sm border-2 border-black bg-emerald-950/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-400 shadow-[1px_1px_0_#000]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Coordination
                  </span>
                )}

                {isCreator && (
                  <span className="inline-flex items-center gap-1 rounded-sm border-2 border-black bg-[var(--neon-yellow)] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-black shadow-[1px_1px_0_#000]">
                    <StarIcon className="h-2.5 w-2.5 shrink-0" />
                    <span>Host</span>
                  </span>
                )}
              </div>

              <h1 className="mt-2 text-base font-extrabold text-white truncate max-w-md sm:text-lg">
                {roomName}
              </h1>

              <div className="mt-1 flex items-center gap-3 text-xs text-[var(--fg-muted)]">
                <button
                  type="button"
                  onClick={() => setShowParticipants((prev) => !prev)}
                  className="cursor-pointer font-bold text-[var(--neon-cyan)] hover:underline flex items-center gap-1.5"
                >
                  <UsersIcon className="h-3.5 w-3.5" />
                  <span>{room.memberCount} Participants</span>
                </button>
                {room.post.expiresAt && !roomClosed && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[var(--neon-yellow)] font-medium">
                    <ClockIcon className="h-3 w-3" />
                    <span>Auto-expires soon</span>
                  </span>
                )}
              </div>
            </div>

            {/* Poster / Member Controls */}
            <div className="flex items-center gap-2">
              {isCreator ? (
                !roomClosed && (
                  <button
                    type="button"
                    onClick={() => setPendingConfirm("close")}
                    className="retro-btn inline-flex items-center gap-1 text-xs font-black cursor-pointer"
                  >
                    <span>Close Room</span>
                    <XIcon className="h-3 w-3 shrink-0" />
                  </button>
                )
              ) : (
                isMember &&
                !roomClosed && (
                  <button
                    type="button"
                    onClick={() => setPendingConfirm("leave")}
                    className="retro-btn-outline text-xs cursor-pointer"
                  >
                    Leave Room
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Non-member Join Callout */}
        {!isMember ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center bg-black/40">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-sm border-2 border-black bg-[var(--neon-yellow)] text-black shadow-[2px_2px_0_#000]">
              <UsersIcon className="h-6 w-6" />
            </div>
            <h2 className="text-base font-bold text-white sm:text-lg">
              Join this Campus Room
            </h2>
            <p className="comic-sub font-readable mx-auto max-w-sm mt-1">
              Join to send messages, coordinate pickup spots, or make an offer on this post.
            </p>
            {currentUser ? (
              <button
                type="button"
                onClick={() => void handleJoin()}
                disabled={roomClosed || joining}
                className="retro-btn mt-5 cursor-pointer disabled:opacity-40"
              >
                {joining ? "Joining Room..." : "Join Coordination Room ↗"}
              </button>
            ) : (
              <Link
                href={`/login?redirect=${encodeURIComponent(`/rooms?postId=${postId}`)}`}
                className="retro-btn mt-5 inline-block text-xs font-bold"
              >
                Sign in to Join Room ↗
              </Link>
            )}
          </div>

        ) : (
          <>
            {/* Chat Messages Log */}
            <div
              className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5"
              style={{ background: "rgba(6,4,14,0.6)" }}
            >
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center">
                  <div>
                    <p className="text-xs font-bold text-[var(--fg-muted)]">
                      No messages yet. Send the first message to kick off coordination!
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    user={message.user.name}
                    message={message.content}
                    timestamp={formatTime(message.createdAt)}
                    isCurrentUser={message.userId === currentUser?.id}
                  />
                ))
              )}

              {roomClosed && (
                <div className="rounded-sm border-2 border-black bg-red-950/60 p-3 text-center text-xs font-bold text-[var(--accent)] shadow-[2px_2px_0_#000]">
                  This coordination room is closed. Historical messages are preserved.
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Composer */}
            {!roomClosed ? (
              <div className="border-t-3 border-black bg-[rgba(14,10,32,0.95)] p-3 sm:p-4">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void handleSendMessage();
                      }
                    }}
                    placeholder={`Message #${roomType.replace("#", "")} peers...`}
                    className="comic-input font-readable flex-1 px-3 py-2 text-xs text-[var(--fg)] outline-none"
                    disabled={sending}
                  />

                  <button
                    type="button"
                    onClick={() => void handleSendMessage()}
                    disabled={!input.trim() || sending}
                    className="retro-btn text-xs cursor-pointer disabled:opacity-40"
                  >
                    {sending ? "Sending..." : "Send ↗"}
                  </button>
                </div>
                <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-[var(--fg-muted)]">
                  <span>Press Enter to send · Live campus peers</span>
                  <span className="inline-flex items-center gap-1 font-medium">
                    <LockIcon className="h-3 w-3" />
                    <span>Verified students only</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="border-t-3 border-black bg-black/60 p-3 text-center text-xs font-bold text-[var(--fg-muted)]">
                Messaging is disabled because this room was closed by the host.
              </div>
            )}
          </>
        )}
      </div>

      {/* ================= SIDEBAR / WIDGET PANEL ================= */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        {/* 1. Context Specific Widget: Food / Cab / Resell */}
        {roomType === "#foodsplit" && (
          <div className="comic-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-black/40 pb-2">
              <span className="text-xs font-black uppercase text-[var(--tag-food)] inline-flex items-center gap-1.5">
                <UtensilsIcon className="h-3.5 w-3.5" />
                <span>Split Calculator</span>
              </span>
              <span className="text-[10px] font-bold text-[var(--fg-muted)]">
                Fair share
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-[var(--fg-muted)]">
                  Total Bill (₹)
                </label>
                <input
                  type="number"
                  value={billTotal}
                  onChange={(e) => setBillTotal(Number(e.target.value))}
                  className="comic-input font-readable w-full px-2 py-1 mt-1 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-[var(--fg-muted)]">
                  Splitting Members
                </label>
                <div className="flex items-center gap-2 mt-1">
                  {[2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSplitCount(num)}
                      className={`flex-1 py-1 rounded-sm border font-bold text-xs ${
                        splitCount === num
                          ? "border-[var(--tag-food)] bg-[var(--tag-food)] text-white"
                          : "border-black bg-black/40 text-[var(--fg-muted)]"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-sm border-2 border-black bg-black/60 p-2.5 text-center mt-2">
                <span className="text-[10px] text-[var(--fg-muted)] uppercase tracking-wider block">
                  Per Person Share
                </span>
                <span className="text-lg font-black text-[var(--tag-food)]">
                  ₹{calculatedPerPerson}
                </span>
              </div>

              {!roomClosed && isMember && (
                <button
                  type="button"
                  onClick={handleShareSplitInChat}
                  className="retro-btn-outline w-full text-center text-[11px] font-bold cursor-pointer"
                >
                  Post Share to Chat ↗
                </button>
              )}
            </div>
          </div>
        )}

        {roomType === "#cabsplit" && (
          <div className="comic-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-black/40 pb-2">
              <span className="text-xs font-black uppercase text-[var(--tag-cab)] inline-flex items-center gap-1.5">
                <CarIcon className="h-3.5 w-3.5" />
                <span>Cab Itinerary</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-400 inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_#00ff88]" />
                <span>Ready</span>
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="rounded-sm border border-black bg-black/40 p-2">
                <span className="text-[10px] uppercase font-bold text-[var(--fg-muted)] block">
                  Departure Time
                </span>
                <span className="font-bold text-white text-sm">
                  {room.post.departureTime || "Early Morning"}
                </span>
              </div>

              <div className="rounded-sm border border-black bg-black/40 p-2">
                <span className="text-[10px] uppercase font-bold text-[var(--fg-muted)] block">
                  Pickup Location
                </span>
                <span className="font-bold text-[var(--neon-cyan)] text-xs inline-flex items-center gap-1">
                  <PinIcon className="h-3 w-3 shrink-0" />
                  <span>{room.post.pickupLocation || "Campus Main Gate"}</span>
                </span>
              </div>

              <div className="rounded-sm border border-black bg-black/40 p-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-[var(--fg-muted)]">
                    Seats Filled
                  </span>
                  <span className="text-[10px] font-bold text-white">
                    {room.post.seatsFilled || 2} / {room.post.seatsTotal || 4} Seats
                  </span>
                </div>
                {/* Visual Seat Indicators */}
                <div className="flex gap-1.5">
                  {Array.from({ length: room.post.seatsTotal || 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2.5 flex-1 rounded-sm border ${
                        idx < (room.post.seatsFilled || 2)
                          ? "border-[var(--neon-cyan)] bg-[var(--neon-cyan)]"
                          : "border-black/60 bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {roomType === "#resell" && (
          <div className="comic-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-black/40 pb-2">
              <span className="text-xs font-black uppercase text-[var(--tag-resell)] inline-flex items-center gap-1.5">
                <TagIcon className="h-3.5 w-3.5" />
                <span>Resell Room</span>
              </span>
              <span
                className={`tag-pill text-[10px] ${
                  room.resellStatus === "SOLD"
                    ? "tag-food"
                    : room.resellStatus === "RESERVED"
                    ? "tag-lost"
                    : "tag-found"
                }`}
              >
                {room.resellStatus || "AVAILABLE"}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-sm border border-black bg-black/40 p-2">
                <span className="text-[10px] uppercase font-bold text-[var(--fg-muted)]">
                  Asking Price
                </span>
                <span className="text-base font-black text-[var(--neon-green)]">
                  {room.post.price || "₹2,800"}
                </span>
              </div>

              {room.post.itemCondition && (
                <div className="rounded-sm border border-black bg-black/40 p-2">
                  <span className="text-[10px] uppercase font-bold text-[var(--fg-muted)] block">
                    Condition
                  </span>
                  <span className="text-xs font-bold text-white">
                    {room.post.itemCondition}
                  </span>
                </div>
              )}

              {/* Negotiation Offers Section */}
              <div className="border-t border-black/40 pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-[var(--fg-muted)]">
                    Buyer Offers
                  </span>
                  {!isCreator && !roomClosed && (
                    <button
                      type="button"
                      onClick={() => setShowOfferModal(true)}
                      className="cursor-pointer text-[10px] font-bold text-[var(--tag-resell)] hover:underline"
                    >
                      + Make Offer
                    </button>
                  )}
                </div>

                {room.offers && room.offers.length > 0 ? (
                  <div className="space-y-1.5">
                    {room.offers.map((offer) => (
                      <div
                        key={offer.id}
                        className="rounded-sm border border-black bg-[rgba(18,12,36,0.9)] p-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{offer.buyerName}</span>
                          <span className="font-black text-[var(--neon-green)]">
                            ₹{offer.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[10px]">
                          <span className="text-[var(--fg-muted)]">{offer.timestamp}</span>
                          {offer.status === "ACCEPTED" ? (
                            <span className="font-bold text-emerald-400 inline-flex items-center gap-1">
                              <CheckIcon className="h-3 w-3 text-emerald-400 shrink-0" />
                              <span>Accepted</span>
                            </span>
                          ) : isCreator && !roomClosed ? (
                            <button
                              type="button"
                              onClick={() => void handleAcceptOffer(offer.id)}
                              className="retro-btn text-[9px] py-0.5 px-2"
                            >
                              Accept Offer
                            </button>
                          ) : (
                            <span className="text-amber-400 font-bold inline-flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                              <span>Pending</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-[var(--fg-muted)] italic">
                    No offers placed yet.
                  </p>
                )}
              </div>

              <div className="font-readable rounded-sm border border-black/40 bg-amber-500/10 p-2 text-[10px] text-amber-200/90 leading-tight">
                <LockIcon className="h-3 w-3 inline mr-1 text-amber-300 align-text-bottom" />
                <span>Campus policy: Payment happens in person during physical item inspection.</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. Participants Roster Panel */}
        <div className="comic-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-black/40 pb-2">
            <span className="text-xs font-black uppercase text-white inline-flex items-center gap-1.5">
              <UsersIcon className="h-3.5 w-3.5" />
              <span>Room Roster ({room.participants?.length ?? 0})</span>
            </span>
          </div>

          <div className="space-y-2">
            {(room.participants ?? []).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-sm border border-black bg-black/40 p-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      p.isOnline ? "bg-emerald-400 shadow-[0_0_6px_#00ff88]" : "bg-gray-500"
                    }`}
                  />
                  <span className="font-bold text-white">{p.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {p.isCreator && (
                    <span className="rounded-sm bg-[var(--neon-yellow)] px-1.5 py-0.2 text-[9px] font-black text-black">
                      Host
                    </span>
                  )}
                  <span className="text-[10px] text-[var(--fg-muted)]">
                    {p.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= MAKE OFFER MODAL ================= */}
      {showOfferModal && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm"
          onClick={() => setShowOfferModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="offer-modal-title"
        >
          <div
            className="comic-modal flex flex-col w-full max-w-sm max-h-[calc(100vh-32px)] sm:max-h-[calc(100vh-48px)] rounded-sm overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 flex items-center justify-between border-b-2 border-black bg-[rgba(18,10,32,0.98)] px-4 py-3 sm:px-5">
              <h3 id="offer-modal-title" className="text-sm font-black uppercase text-white">
                Make Negotiation Offer
              </h3>
              <button
                type="button"
                onClick={() => setShowOfferModal(false)}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-sm border-2 border-black bg-[#16192b] hover:bg-[#252a48] text-white transition-colors cursor-pointer shadow-[2px_2px_0_#000]"
                aria-label="Close dialog"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              <div className="rounded-sm border border-amber-500/40 bg-amber-500/10 p-2.5 text-[11px] text-amber-200/90 text-left font-readable">
                <span className="font-bold">Notice:</span> Server does not have an offer negotiation API. You can propose an amount here, or negotiate terms directly in room chat.
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-[var(--fg-muted)] block mb-1">
                  Your Offer Amount (₹)
                </label>
                <input
                  type="number"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  placeholder="e.g. 2500"
                  className="comic-input font-readable w-full px-3 py-2 text-sm text-white"
                  autoFocus
                />
              </div>
              <p className="font-readable text-[11px] text-[var(--fg-muted)] leading-tight">
                Use room chat below for real-time agreement and campus handoff.
              </p>
            </div>

            <div className="shrink-0 flex justify-end gap-2 border-t-2 border-black bg-[rgba(18,10,32,0.98)] px-4 py-3 sm:px-5">
              <button
                type="button"
                onClick={() => setShowOfferModal(false)}
                className="retro-btn-outline text-xs min-h-[38px] px-3.5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleMakeOffer()}
                disabled={!offerAmount.trim()}
                className="retro-btn text-xs font-black min-h-[38px] px-3.5 cursor-pointer disabled:opacity-40"
              >
                Submit Offer ↗
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PARTICIPANTS MODAL ================= */}
      {showParticipants && room && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm"
          onClick={() => setShowParticipants(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="participants-modal-title"
        >
          <div
            className="comic-modal flex flex-col w-full max-w-sm max-h-[calc(100vh-32px)] sm:max-h-[calc(100vh-48px)] rounded-sm overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 flex items-center justify-between border-b-2 border-black bg-[rgba(18,10,32,0.98)] px-4 py-3 sm:px-5">
              <h3 id="participants-modal-title" className="text-sm font-black uppercase text-white inline-flex items-center gap-1.5">
                <UsersIcon className="h-4 w-4" />
                <span>Room Participants ({room.participants.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowParticipants(false)}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-sm border-2 border-black bg-[#16192b] hover:bg-[#252a48] text-white transition-colors cursor-pointer shadow-[2px_2px_0_#000]"
                aria-label="Close dialog"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2">
              {room.participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-sm border border-black bg-black/40 p-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        p.isOnline
                          ? "bg-emerald-400 shadow-[0_0_6px_#00ff88]"
                          : "bg-gray-500"
                      }`}
                    />
                    <span className="font-bold text-white">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {p.isCreator && (
                      <span className="rounded-sm bg-[var(--neon-yellow)] px-1.5 py-0.2 text-[9px] font-black text-black">
                        Host
                      </span>
                    )}
                    <span className="text-[10px] text-[var(--fg-muted)]">
                      {p.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="shrink-0 flex justify-end border-t-2 border-black bg-[rgba(18,10,32,0.98)] px-4 py-3 sm:px-5">
              <button
                type="button"
                onClick={() => setShowParticipants(false)}
                className="retro-btn-outline text-xs min-h-[38px] px-4 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
