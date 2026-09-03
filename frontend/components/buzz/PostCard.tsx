"use client";

import { useMemo } from "react";
import { Post } from "@/types";

interface PostCardProps {
  post: Post;
  onAction: (post: Post) => void;
}

export default function PostCard({
  post,
  onAction,
}: PostCardProps) {
  const primaryHashtag =
    post.hashtags[0] || "#campus";

  const isRoomPost = useMemo(
    () =>
      ["FOOD_SPLIT", "CAB_SPLIT", "RESELL"].includes(
        post.interactionType
      ),
    [post.interactionType]
  );

  const actionLabel = useMemo(() => {
    switch (post.interactionType) {
      case "FOOD_SPLIT":
        return "Join food coordination";

      case "CAB_SPLIT":
        return "Join cab coordination";

      case "RESELL":
        return "Join buyer room";

      case "LOST":
      case "FOUND":
        return "View contact";

      default:
        return "View post";
    }
  }, [post.interactionType]);

  const actionIcon = isRoomPost ? "↗" : "→";

  const formattedDate = new Date(
    post.createdAt
  ).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });

  return (
    <article className="cb-card cb-card-hover cb-fade-up overflow-hidden">
      {/* Post image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-100 text-sm text-gray-400">
            No image available
          </div>
        )}

        {/* Primary hashtag */}
        <div className="absolute left-4 top-4">
          <span className="rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur">
            {primaryHashtag}
          </span>
        </div>

        {/* Active / closed status */}
        <div className="absolute bottom-4 right-4">
          <span
            className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold shadow-sm backdrop-blur ${
              post.status === "ACTIVE"
                ? "border-white/40 bg-black/75 text-white"
                : "border-gray-200 bg-white/90 text-gray-600"
            }`}
          >
            {post.status === "ACTIVE"
              ? "● Active"
              : "Closed"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        {/* Metadata */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-gray-400">
            Campus Buzz
          </span>

          <time
            dateTime={post.createdAt}
            className="text-xs text-gray-400"
          >
            {formattedDate}
          </time>
        </div>

        {/* Title */}
        <h2 className="mt-3 text-lg font-bold leading-7 tracking-tight text-gray-950 sm:text-xl">
          {post.title}
        </h2>

        {/* Description */}
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">
          {post.description}
        </p>

        {/* Author */}
        <div className="mt-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-950 text-[10px] font-bold text-white">
            {post.author
              ? post.author.charAt(0).toUpperCase()
              : "?"}
          </div>

          <span className="text-xs font-medium text-gray-500">
            {post.author}
          </span>
        </div>

        {/* Hashtags */}
        {post.hashtags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.hashtags.map((hashtag) => (
              <span
                key={hashtag}
                className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600"
              >
                {hashtag}
              </span>
            ))}
          </div>
        )}

        {/* Expiry */}
        {post.expiresAt &&
          post.status === "ACTIVE" && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-orange-100 bg-orange-50 px-3.5 py-2.5">
              <span className="text-sm">⏱</span>

              <div>
                <p className="text-[11px] font-semibold text-orange-800">
                  Coordination expires
                </p>

                <p className="text-[10px] text-orange-600">
                  {new Date(
                    post.expiresAt
                  ).toLocaleString(undefined, {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          )}

        {/* Divider */}
        <div className="my-5 h-px bg-gray-100" />

        {/* Action */}
        <button
          type="button"
          onClick={() => onAction(post)}
          disabled={post.status === "CLOSED"}
          className={`group flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
            post.status === "CLOSED"
              ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
              : "border-gray-200 bg-white hover:border-gray-950 hover:bg-gray-950"
          }`}
        >
          <div>
            <p
              className={`text-sm font-semibold ${
                post.status === "CLOSED"
                  ? "text-gray-500"
                  : "text-gray-900 group-hover:text-white"
              }`}
            >
              {post.status === "CLOSED"
                ? "Post closed"
                : actionLabel}
            </p>

            <p
              className={`mt-0.5 text-[11px] ${
                post.status === "CLOSED"
                  ? "text-gray-400"
                  : "text-gray-400 group-hover:text-gray-400"
              }`}
            >
              {post.status === "CLOSED"
                ? "This coordination is no longer active"
                : isRoomPost
                  ? "Coordinate with students"
                  : "Connect directly with the poster"}
            </p>
          </div>

          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
              post.status === "CLOSED"
                ? "bg-gray-100 text-gray-400"
                : "bg-gray-100 text-gray-700 group-hover:bg-white/10 group-hover:text-white"
            }`}
          >
            {post.status === "CLOSED"
              ? "×"
              : actionIcon}
          </span>
        </button>
      </div>
    </article>
  );
}