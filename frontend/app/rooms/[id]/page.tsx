"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

import ChatRoom from "@/components/rooms/ChatRoom";
import { getPosts, getRooms } from "@/lib/api";
import type { Post } from "@/types";
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

export default function RoomDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: roomIdOrPostId } = use(params);

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchRoomDetails() {
      try {
        const [postsData, roomsData] = await Promise.all([getPosts(), getRooms()]);
        if (ignore) return;

        // Find post by direct ID, chatRoomId, or room postId
        let matchedPost = postsData.find(
          (p) => p.id === roomIdOrPostId || p.chatRoomId === roomIdOrPostId
        );
        if (!matchedPost) {
          const matchedRoom = roomsData.find(
            (r) => r.id === roomIdOrPostId || `r-${r.postId}` === roomIdOrPostId
          );
          if (matchedRoom?.postId) {
            matchedPost = postsData.find((p) => p.id === matchedRoom.postId);
          }
        }

        if (!matchedPost) {
          setError("The requested coordination room was not found or has expired.");
        } else {
          setPost(matchedPost);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Failed to load coordination room."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchRoomDetails();
    return () => {
      ignore = true;
    };
  }, [roomIdOrPostId]);

  if (loading) {
    return (
      <main className="comic-page">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-8 w-28 animate-pulse rounded-sm bg-white/10" />
            <div className="h-8 w-24 animate-pulse rounded-sm bg-white/10" />
          </div>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="h-96 flex-1 animate-pulse rounded-sm border-3 border-black bg-[rgba(14,10,32,0.8)] shadow-[4px_4px_0_#000]" />
            <div className="h-96 w-full animate-pulse rounded-sm border-3 border-black bg-[rgba(14,10,32,0.8)] md:w-80 shadow-[4px_4px_0_#000]" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="comic-page">
        <div className="mx-auto max-w-xl py-12">
          <div className="comic-card p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-sm border-2 border-black bg-[rgba(255,45,74,0.2)] text-xl text-[var(--accent)] shadow-[2px_2px_0_#000]">
              <AlertCircleIcon className="h-6 w-6" />
            </div>
            <h2 className="text-base font-bold text-white">Room Not Found</h2>
            <p className="font-readable mt-1 text-xs text-[var(--fg-muted)]">
              {error || "This coordination room may have been closed or removed."}
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

  const config = roomTypeConfig[post.interactionType] || {
    tag: "#coordination",
    label: "Live Room",
    color: "var(--neon-cyan)",
    icon: UsersIcon,
  };

  const roomType =
    post.hashtags.find((tag) => ["#foodsplit", "#cabsplit", "#resell"].includes(tag)) ||
    (post.interactionType === "FOOD_SPLIT"
      ? "#foodsplit"
      : post.interactionType === "CAB_SPLIT"
      ? "#cabsplit"
      : "#resell");

  return (
    <main className="comic-page">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link href="/rooms" className="retro-btn-outline cursor-pointer text-xs">
              ← All Rooms
            </Link>
            <Link href="/buzz" className="retro-btn-outline cursor-pointer text-xs">
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

        <ChatRoom
          postId={post.id}
          roomName={post.title}
          roomType={roomType}
        />
      </div>
    </main>
  );
}
