"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import ChatRoom from "@/components/rooms/ChatRoom";
import { getPosts, getRooms } from "@/lib/api";
import type { Post, Room } from "@/types";
import {
  AlertCircleIcon,
  CarIcon,
  TagIcon,
  UsersIcon,
  UtensilsIcon,
} from "@/components/ui/Icons";

const roomTypeConfig: Record<
  string,
  {
    tag: string;
    label: string;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  FOOD_SPLIT: {
    tag: "#foodsplit",
    label: "Food Split",
    color: "var(--tag-food)",
    icon: UtensilsIcon,
  },
  CAB_SPLIT: {
    tag: "#cabsplit",
    label: "Cab Split",
    color: "var(--tag-cab)",
    icon: CarIcon,
  },
  RESELL: {
    tag: "#resell",
    label: "Resell",
    color: "var(--tag-resell)",
    icon: TagIcon,
  },
};

function RoomsContent() {
  const searchParams = useSearchParams();
  const postId = searchParams.get("postId");

  const [post, setPost] = useState<Post | null>(null);
  const [allRoomPosts, setAllRoomPosts] = useState<Post[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomFilter, setRoomFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchRooms() {
      try {
        const [postsData, roomsData] = await Promise.all([getPosts(), getRooms()]);
        if (ignore) return;

        setRooms(roomsData);

        const activeRooms = postsData.filter(
          (item) =>
            ["FOOD_SPLIT", "CAB_SPLIT", "RESELL"].includes(item.interactionType) &&
            item.status === "ACTIVE"
        );
        setAllRoomPosts(activeRooms);

        if (postId) {
          const found = postsData.find((item) => item.id === postId);
          if (!found) {
            setError("The selected coordination room could not be found.");
          } else {
            setPost(found);
          }
        } else {
          setPost(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load coordination rooms."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchRooms();
    return () => {
      ignore = true;
    };
  }, [postId]);

  const filteredRoomPosts = useMemo(() => {
    if (roomFilter === "ALL") return allRoomPosts;
    return allRoomPosts.filter((p) => p.hashtags.includes(roomFilter));
  }, [allRoomPosts, roomFilter]);

  // Loading skeleton
  if (loading) {
    return (
      <main className="comic-page">
        <div className="mx-auto max-w-4xl py-6">
          <div className="comic-card animate-pulse p-8 text-center">
            <div className="mx-auto mb-4 h-8 w-48 rounded-sm bg-white/10" />
            <p className="text-xs font-semibold text-[var(--neon-cyan)]">
              Connecting to campus coordination rooms...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Active Post Room Chat View
  if (postId && post) {
    const roomType =
      post.interactionType === "FOOD_SPLIT"
        ? "#foodsplit"
        : post.interactionType === "CAB_SPLIT"
        ? "#cabsplit"
        : "#resell";

    const config = roomTypeConfig[post.interactionType] || {
      tag: roomType,
      label: "Room",
      color: "var(--neon-cyan)",
      icon: UsersIcon,
    };

    return (
      <main className="comic-page">
        <div className="mx-auto max-w-6xl">
          {/* Navigation & Header */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Link
                href="/rooms"
                className="retro-btn-outline cursor-pointer text-xs"
              >
                ← All Rooms
              </Link>
              <Link
                href="/buzz"
                className="retro-btn-outline cursor-pointer text-xs"
              >
                Campus Buzz Feed
              </Link>
            </div>
            <div
              className="flex items-center gap-1.5 rounded-sm border-2 border-black bg-[rgba(10,6,24,0.9)] px-2.5 py-1 text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0_#000]"
              style={{ color: config.color }}
            >
              <config.icon className="h-3.5 w-3.5" />
              <span>{config.tag}</span>
            </div>
          </div>

          {/* Realtime ChatRoom Component */}
          <ChatRoom
            postId={postId}
            roomName={post.title}
            roomType={roomType}
          />
        </div>
      </main>
    );
  }

  // Error state when specific postId was requested but failed
  if (postId && error) {
    return (
      <main className="comic-page">
        <div className="mx-auto max-w-xl py-12">
          <div className="comic-card p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-sm border-2 border-black bg-[rgba(255,45,74,0.2)] text-xl text-[var(--accent)] shadow-[2px_2px_0_#000]">
              <AlertCircleIcon className="h-6 w-6" />
            </div>
            <h2 className="text-base font-bold text-white">
              Room Unavailable
            </h2>
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              {error}
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Link href="/rooms" className="retro-btn text-xs">
                Browse Active Rooms
              </Link>
              <Link href="/buzz" className="retro-btn-outline text-xs">
                Back to Feed
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Default Navigation to /rooms (List of All Active Rooms)
  return (
    <main className="comic-page">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="buzz-title">COORDINATION ROOMS</h1>
                <span className="rounded-sm border-2 border-black bg-[var(--neon-cyan)] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-black shadow-[2px_2px_0_#000]">
                  Live
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold tracking-wide text-[var(--fg-muted)] sm:text-sm">
                Join active rooms to coordinate food splits, ride shares, and campus resale.
              </p>
            </div>

            <Link
              href="/buzz"
              className="retro-btn mt-3 shrink-0 text-xs sm:mt-0"
            >
              Browse Campus Buzz ↗
            </Link>
          </div>
        </header>

        {/* Filter Pills */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {[
            { label: "All Rooms", value: "ALL" },
            { label: "Food Splits", value: "#foodsplit" },
            { label: "Cab Splits", value: "#cabsplit" },
            { label: "Resell Rooms", value: "#resell" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setRoomFilter(tab.value)}
              className={`filter-pill cursor-pointer ${
                roomFilter === tab.value ? "filter-pill--active" : ""
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List of active coordination rooms */}
        {filteredRoomPosts.length === 0 ? (
          <div className="comic-card p-10 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-sm border-2 border-black bg-[rgba(42,240,255,0.12)] text-[var(--neon-cyan)] shadow-[2px_2px_0_#000]">
              <UsersIcon className="h-7 w-7" />
            </div>
            <h2 className="text-base font-bold text-white sm:text-lg">
              No Active Rooms in this Category
            </h2>
            <p className="font-readable mx-auto mt-1 max-w-md text-xs text-[var(--fg-muted)]">
              Coordination rooms open automatically when students publish a #foodsplit, #cabsplit, or #resell post on Campus Buzz.
            </p>
            <div className="mt-5">
              <Link href="/buzz" className="retro-btn text-xs">
                Go to Campus Buzz Feed
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredRoomPosts.map((rPost) => {
              const config = roomTypeConfig[rPost.interactionType] || {
                tag: rPost.hashtags[0] || "#room",
                label: "Room",
                color: "var(--neon-cyan)",
                icon: UsersIcon,
              };

              const matchedRoom = rooms.find(
                (r) => r.postId === rPost.id || r.id === `r-${rPost.id}`
              );
              const participantCount = matchedRoom
                ? matchedRoom.participants?.length ?? matchedRoom.members?.length
                : undefined;

              return (
                <div
                  key={rPost.id}
                  className="comic-card flex flex-col justify-between p-4 transition-all duration-150 hover:-translate-y-0.5"
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-center justify-between border-b border-black/40 pb-2">
                      <div
                        className="flex items-center gap-1.5 rounded-sm border-2 border-black bg-[rgba(10,6,24,0.9)] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-[1px_1px_0_#000]"
                        style={{ color: config.color }}
                      >
                        <config.icon className="h-3 w-3" />
                        <span>{config.tag}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--fg-muted)]">
                        {participantCount !== undefined && (
                          <span className="inline-flex items-center gap-1">
                            <UsersIcon className="h-3 w-3" />
                            <span>{participantCount} joined</span>
                          </span>
                        )}
                        <span>· By {rPost.author}</span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="mt-2.5 line-clamp-2 text-sm font-bold text-white">
                      {rPost.title}
                    </h3>
                    <p className="font-readable mt-1 line-clamp-2 text-xs text-[var(--fg-muted)] leading-relaxed">
                      {rPost.description}
                    </p>

                    {/* Specific preview attributes */}
                    {rPost.departureTime && (
                      <p className="mt-2 text-[11px] font-bold text-[var(--neon-cyan)] inline-flex items-center gap-1">
                        <CarIcon className="h-3 w-3 shrink-0" />
                        <span>Departs: {rPost.departureTime}</span>
                      </p>
                    )}
                    {rPost.price && (
                      <p className="mt-2 text-[11px] font-bold text-[var(--neon-green)] inline-flex items-center gap-1">
                        <TagIcon className="h-3 w-3 shrink-0" />
                        <span>Asking: {rPost.price}</span>
                      </p>
                    )}
                  </div>

                  {/* Action */}
                  <div className="mt-4 flex items-center justify-between border-t border-black/40 pt-3">
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Room Open
                    </span>
                    <Link
                      href={`/rooms?postId=${rPost.id}`}
                      className="retro-btn text-xs font-black"
                    >
                      OPEN ROOM ↗
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default function RoomsPage() {
  return (
    <Suspense
      fallback={
        <main className="comic-page">
          <div className="mx-auto max-w-4xl py-6">
            <div className="comic-card animate-pulse p-8 text-center">
              <p className="text-xs font-semibold text-[var(--fg-muted)]">
                Loading room...
              </p>
            </div>
          </div>
        </main>
      }
    >
      <RoomsContent />
    </Suspense>
  );
}
