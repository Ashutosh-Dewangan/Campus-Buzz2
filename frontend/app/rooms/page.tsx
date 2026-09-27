"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import ChatRoom from "@/components/rooms/ChatRoom";
import { getPosts } from "@/lib/api";
import type { Post } from "@/types";

const roomTypeConfig: Record<
  string,
  { tag: string; label: string; color: string; icon: string }
> = {
  FOOD_SPLIT: {
    tag: "#foodsplit",
    label: "Food Split",
    color: "var(--tag-food)",
    icon: "🍕",
  },
  CAB_SPLIT: {
    tag: "#cabsplit",
    label: "Cab Split",
    color: "var(--tag-cab)",
    icon: "🚕",
  },
  RESELL: {
    tag: "#resell",
    label: "Resell",
    color: "var(--tag-resell)",
    icon: "🏷️",
  },
};

function RoomsContent() {
  const searchParams = useSearchParams();
  const postId = searchParams.get("postId");

  const [post, setPost] = useState<Post | null>(null);
  const [allRoomPosts, setAllRoomPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchRooms() {
      try {
        const posts = await getPosts();
        if (ignore) return;

        const activeRooms = posts.filter(
          (item) =>
            ["FOOD_SPLIT", "CAB_SPLIT", "RESELL"].includes(item.interactionType) &&
            item.status === "ACTIVE"
        );
        setAllRoomPosts(activeRooms);

        if (postId) {
          const found = posts.find((item) => item.id === postId);
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

  // Loading skeleton
  if (loading) {
    return (
      <main className="comic-page">
        <div className="mx-auto max-w-4xl py-6">
          <div className="comic-card animate-pulse p-8 text-center">
            <div className="mx-auto mb-4 h-8 w-48 rounded-sm bg-white/10" />
            <p className="text-xs font-semibold text-[var(--fg-muted)]">
              Connecting to campus rooms...
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
      icon: "👥",
    };

    return (
      <main className="comic-page">
        <div className="mx-auto max-w-5xl">
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
              <span>{config.icon}</span>
              <span>{config.tag}</span>
            </div>
          </div>

          {/* Post Header Card */}
          <div className="comic-card mb-4 p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-[var(--fg-muted)]">
                  Coordinating Post
                </p>
                <h1 className="text-base font-bold text-white sm:text-lg">
                  {post.title}
                </h1>
                <p className="mt-0.5 line-clamp-2 text-xs text-[var(--fg-muted)]">
                  {post.description}
                </p>
              </div>
              <div className="shrink-0 text-left sm:text-right">
                <span className="text-xs font-semibold text-[var(--fg-muted)]">
                  Posted by <span className="font-bold text-white">{post.author}</span>
                </span>
              </div>
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
              ⚠
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

  // Default / Direct Navigation to /rooms (No postId selected)
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

        {/* List of active coordination rooms */}
        {allRoomPosts.length === 0 ? (
          <div className="comic-card p-10 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-sm border-2 border-black bg-[rgba(42,240,255,0.12)] text-2xl text-[var(--neon-cyan)] shadow-[2px_2px_0_#000]">
              👥
            </div>
            <h2 className="text-base font-bold text-white sm:text-lg">
              No Active Rooms Right Now
            </h2>
            <p className="mx-auto mt-1 max-w-md text-xs text-[var(--fg-muted)]">
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
            {allRoomPosts.map((rPost) => {
              const config = roomTypeConfig[rPost.interactionType] || {
                tag: rPost.hashtags[0] || "#room",
                label: "Room",
                color: "var(--neon-cyan)",
                icon: "👥",
              };

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
                        <span>{config.icon}</span>
                        <span>{config.tag}</span>
                      </div>
                      <span className="text-[11px] text-[var(--fg-muted)]">
                        By {rPost.author}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="mt-2.5 line-clamp-2 text-sm font-bold text-white">
                      {rPost.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-[var(--fg-muted)]">
                      {rPost.description}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="mt-4 flex items-center justify-between border-t border-black/40 pt-3">
                    <span className="text-[10px] font-bold text-emerald-400">
                      ● Active Coordination
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