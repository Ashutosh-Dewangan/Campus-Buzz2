"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

import ChatRoom from "@/components/rooms/ChatRoom";
import { getPosts } from "@/lib/api";
import type { Post } from "@/types";

function RoomsContent() {
  const searchParams = useSearchParams();
  const postId = searchParams.get("postId");

  const [post, setPost] =
    useState<Post | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadPost() {
      if (!postId) {
        setError(
          "No Campus Buzz post was selected."
        );
        setLoading(false);
        return;
      }

      try {
        const posts = await getPosts();

        const foundPost =
          posts.find(
            (item) => item.id === postId
          );

        if (!foundPost) {
          setError(
            "The selected post could not be found."
          );
          return;
        }

        setPost(foundPost);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load post"
        );
      } finally {
        setLoading(false);
      }
    }

    void loadPost();
  }, [postId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              Loading room...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !post || !postId) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-medium text-red-600">
              {error ?? "Room unavailable"}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const roomType =
    post.interactionType === "FOOD_SPLIT"
      ? "#foodsplit"
      : post.interactionType === "CAB_SPLIT"
        ? "#cabsplit"
        : "#resell";

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-orange-500">
            Campus coordination
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
            Chat Room
          </h1>

          <p className="mt-1 max-w-xl text-sm leading-6 text-gray-500">
            Coordinate directly with students interested in this post.
          </p>
        </header>

        <section className="min-w-0">
          <div className="mb-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400">
              Campus Buzz post
            </p>

            <h2 className="mt-1 text-sm font-bold text-gray-900">
              {post.title}
            </h2>
          </div>

          <ChatRoom
            postId={postId}
            roomName={post.title}
            roomType={roomType}
          />
        </section>
      </div>
    </main>
  );
}

export default function RoomsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-gray-500">
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