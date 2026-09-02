"use client";

import { Post } from "@/types";
import { useEffect, useState } from "react";

interface PostCardProps {
  post: Post;
  onAction: (post: Post) => void;
}

function getRemainingTime(
  expiresAt?: string
) {
  if (!expiresAt) return null;

  const difference =
    new Date(expiresAt).getTime() -
    Date.now();

  if (difference <= 0) {
    return "Expired";
  }

  const seconds = Math.floor(
    difference / 1000
  );

  const days = Math.floor(
    seconds / 86400
  );

  const hours = Math.floor(
    (seconds % 86400) / 3600
  );

  const minutes = Math.floor(
    (seconds % 3600) / 60
  );

  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }

  return `${minutes}m remaining`;
}

export default function PostCard({
  post,
  onAction,
}: PostCardProps) {
  const [remainingTime, setRemainingTime] =
    useState(
      getRemainingTime(post.expiresAt)
    );

  useEffect(() => {
    if (!post.expiresAt) {
      return;
    }

    const interval = setInterval(() => {
      setRemainingTime(
        getRemainingTime(post.expiresAt)
      );
    }, 1000);

    return () =>
      clearInterval(interval);
  }, [post.expiresAt]);

  const isContactPost =
    post.interactionType === "LOST" ||
    post.interactionType === "FOUND";

  const buttonText = isContactPost
    ? "View Contact"
    : "Join Room";

  return (
    <article className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
      <img
        src={post.image}
        alt={post.title}
        className="h-52 w-full object-cover"
      />

      <div className="p-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {post.hashtags.map((hashtag) => (
              <span
                key={hashtag}
                className="text-sm font-semibold text-blue-600"
              >
                {hashtag}
              </span>
            ))}
          </div>

          <span className="shrink-0 text-xs text-gray-500">
            {post.author}
          </span>
        </div>

        <h2 className="text-xl font-bold text-gray-900">
          {post.title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          {post.description}
        </p>

        {post.expiresAt && (
          <div className="mt-4 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700">
            ⏱ {remainingTime}
          </div>
        )}

        <button
          onClick={() => onAction(post)}
          className="mt-4 w-full rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          {buttonText}
        </button>
      </div>
    </article>
  );
}