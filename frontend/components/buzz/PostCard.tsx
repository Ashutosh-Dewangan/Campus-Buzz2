"use client";

import { useEffect, useState, ReactNode } from "react";
import { Post } from "@/types";
import {
  UtensilsIcon,
  CarIcon,
  TagIcon,
  AlertCircleIcon,
  SearchIcon,
  SparkIcon,
  ClockIcon,
  CheckIcon,
} from "@/components/ui/Icons";

interface PostCardProps {
  post: Post;
  onAction: (post: Post) => void;
}

const interactionConfig: Record<
  string,
  { tag: string; label: string; color: string; bg: string; icon: ReactNode }
> = {
  FOOD_SPLIT: {
    tag: "#foodsplit",
    label: "Food Split",
    color: "var(--tag-food)",
    bg: "rgba(255, 59, 74, 0.15)",
    icon: <UtensilsIcon className="h-3 w-3" />,
  },
  CAB_SPLIT: {
    tag: "#cabsplit",
    label: "Cab Split",
    color: "var(--tag-cab)",
    bg: "rgba(58, 208, 255, 0.15)",
    icon: <CarIcon className="h-3 w-3" />,
  },
  RESELL: {
    tag: "#resell",
    label: "Resell",
    color: "var(--tag-resell)",
    bg: "rgba(180, 79, 255, 0.15)",
    icon: <TagIcon className="h-3 w-3" />,
  },
  LOST: {
    tag: "#lost",
    label: "Lost Item",
    color: "var(--tag-lost)",
    bg: "rgba(255, 225, 74, 0.15)",
    icon: <AlertCircleIcon className="h-3 w-3" />,
  },
  FOUND: {
    tag: "#found",
    label: "Found Item",
    color: "var(--tag-found)",
    bg: "rgba(0, 229, 200, 0.15)",
    icon: <SearchIcon className="h-3 w-3" />,
  },
};

interface ExpiryStatus {
  label: string;
  expired: boolean;
  tier: "normal" | "warning" | "urgent" | "expired";
}

function getExpiryStatus(expiresAt: string): ExpiryStatus | null {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) {
    return { label: "Expired", expired: true, tier: "expired" };
  }

  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let timeString = "";
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    timeString = remHours > 0 ? `${days}d ${remHours}h` : `${days}d`;
  } else if (hours > 0) {
    timeString = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  } else {
    timeString = `${Math.max(1, minutes)}m`;
  }

  let tier: "normal" | "warning" | "urgent" = "normal";
  if (totalMinutes <= 15) {
    tier = "urgent";
  } else if (totalMinutes <= 60) {
    tier = "warning";
  }

  return {
    label: `Expires in ${timeString}`,
    expired: false,
    tier,
  };
}

export default function PostCard({ post, onAction }: PostCardProps) {
  const config =
    interactionConfig[post.interactionType ?? ""] || {
      tag: post.hashtags[0] || "#campus",
      label: "Campus",
      color: "var(--neon-cyan)",
      bg: "rgba(42, 240, 255, 0.12)",
      icon: <SparkIcon className="h-3 w-3" />,
    };

  const primaryTag = config.tag;
  const isRoomPost = ["FOOD_SPLIT", "CAB_SPLIT", "RESELL"].includes(
    post.interactionType
  );

  const [timeDisplay, setTimeDisplay] = useState(() => {
    const now = Date.now();
    const minutesAgo = Math.max(
      0,
      Math.round((now - new Date(post.createdAt).getTime()) / 60000)
    );
    const ago =
      minutesAgo < 1
        ? "just now"
        : minutesAgo < 60
        ? `${minutesAgo}m ago`
        : minutesAgo < 1440
        ? `${Math.floor(minutesAgo / 60)}h ago`
        : `${Math.floor(minutesAgo / 1440)}d ago`;

    let expiryStatus: ExpiryStatus | null = null;
    let expired = false;
    if (post.expiresAt) {
      expiryStatus = getExpiryStatus(post.expiresAt);
      if (expiryStatus?.expired) {
        expired = true;
      }
    }

    return { ago, expiryStatus, expired };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const minutesAgo = Math.max(
        0,
        Math.round((now - new Date(post.createdAt).getTime()) / 60000)
      );
      const ago =
        minutesAgo < 1
          ? "just now"
          : minutesAgo < 60
          ? `${minutesAgo}m ago`
          : minutesAgo < 1440
          ? `${Math.floor(minutesAgo / 60)}h ago`
          : `${Math.floor(minutesAgo / 1440)}d ago`;

      let expiryStatus: ExpiryStatus | null = null;
      let expired = false;
      if (post.expiresAt) {
        expiryStatus = getExpiryStatus(post.expiresAt);
        if (expiryStatus?.expired) {
          expired = true;
        }
      }

      setTimeDisplay({ ago, expiryStatus, expired });
    }, 30000);

    return () => clearInterval(interval);
  }, [post.createdAt, post.expiresAt]);

  const { ago, expiryStatus, expired } = timeDisplay;
  const effectivelyActive = post.status === "ACTIVE" && !expired;
  const authorInitial = post.author ? post.author.charAt(0).toUpperCase() : "?";

  return (
    <article className="group feed-card cb-fade-up transition-all duration-200 hover:-translate-y-0.5">
      {/* Author & Header Metadata */}
      <div className="mb-3 flex items-center justify-between border-b border-black/40 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-sm border-2 border-black bg-gradient-to-br from-[var(--accent)] to-[#8b0018] text-xs font-black text-white shadow-[1px_1px_0_#000]">
            {authorInitial}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 leading-none">
            <span className="text-xs font-bold text-white sm:text-sm">
              {post.author}
            </span>
            <span className="inline-flex items-center gap-1 rounded-sm border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-emerald-400">
              <CheckIcon className="h-2.5 w-2.5 shrink-0" />
              <span>Verified Student</span>
            </span>
            <span className="text-[11px] text-[var(--fg-muted)]">
              · {ago}
            </span>
          </div>
        </div>

        {/* Status Pill */}
        <div>
          {post.status === "CLOSED" ? (
            <span className="rounded-sm border border-black bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              Closed
            </span>
          ) : expired ? (
            <span className="rounded-sm border border-black bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Expired
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-sm border border-black bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Active
            </span>
          )}
        </div>
      </div>

      {/* Post Image */}
      {post.image ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm border-2 border-black bg-black/80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          {/* Category Tag Overlay */}
          <div
            className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-sm border-2 border-black bg-[rgba(10,6,24,0.92)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0_#000]"
            style={{ color: config.color }}
          >
            <span>{config.icon}</span>
            <span>{primaryTag}</span>
          </div>

          {/* Quick Resell Price Badge if present */}
          {post.price && (
            <div className="absolute right-2.5 top-2.5 rounded-sm border-2 border-black bg-[rgba(10,6,24,0.95)] px-2.5 py-1 text-xs font-black text-[var(--neon-green)] shadow-[2px_2px_0_#000]">
              {post.price}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-2 flex items-center justify-between">
          <div
            className="flex items-center gap-1.5 rounded-sm border-2 border-black bg-[rgba(10,6,24,0.9)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0_#000]"
            style={{ color: config.color }}
          >
            <span>{config.icon}</span>
            <span>{primaryTag}</span>
          </div>

          {post.price && (
            <span className="text-xs font-black text-[var(--neon-green)]">
              {post.price}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="mt-3">
        {/* Title */}
        <h2 className="text-base font-bold leading-snug tracking-tight text-white line-clamp-2 sm:text-lg">
          {post.title}
        </h2>

        {/* Description */}
        <p className="font-readable mt-2 text-sm leading-relaxed text-[var(--fg-muted)] line-clamp-3">
          {post.description}
        </p>

        {/* Dynamic Context Snippets */}
        {post.departureTime && (
          <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-[var(--neon-cyan)]">
            <span>Departs: {post.departureTime}</span>
            {post.pickupLocation && <span>· Pickup: {post.pickupLocation}</span>}
          </div>
        )}

        {post.itemCondition && (
          <div className="mt-2 text-[11px] font-bold text-[var(--neon-yellow)]">
            <span>Condition: {post.itemCondition}</span>
          </div>
        )}

        {/* Secondary Hashtags */}
        {post.hashtags.length > 1 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {post.hashtags
              .filter(
                (tag) => tag.toLowerCase() !== primaryTag.toLowerCase()
              )
              .map((tag) => (
                <span
                  key={tag}
                  className="rounded-sm border border-black/60 bg-black/40 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--fg-muted)]"
                >
                  {tag.startsWith("#") ? tag : `#${tag}`}
                </span>
              ))}
          </div>
        )}

        {/* Bottom Row: Expiry & Primary Action */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5 border-t border-black/40 pt-3">
          {/* Expiry indicator if applicable */}
          <div className="flex items-center gap-2">
            {expiryStatus && !expiryStatus.expired && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[10px] font-bold tracking-wide shadow-[1px_1px_0_#000] ${
                  expiryStatus.tier === "urgent"
                    ? "border-2 border-[var(--accent)] bg-[rgba(255,45,74,0.18)] text-[var(--accent)] animate-pulse"
                    : expiryStatus.tier === "warning"
                    ? "border-2 border-amber-500 bg-amber-500/15 text-amber-300"
                    : "border-2 border-black bg-black/60 text-[var(--neon-cyan)]"
                }`}
              >
                <ClockIcon className="h-3 w-3" />
                <span>{expiryStatus.label}</span>
              </span>
            )}
            {expired && (
              <span className="inline-flex items-center rounded-sm border-2 border-black bg-white/10 px-2 py-0.5 text-[10px] font-bold text-[var(--fg-muted)]">
                Expired
              </span>
            )}
          </div>

          {/* Primary Action Button */}
          {effectivelyActive ? (
            <button
              type="button"
              onClick={() => onAction(post)}
              className="retro-btn cursor-pointer text-xs font-black tracking-wider transition-all duration-150"
              style={{
                padding: "6px 14px",
              }}
            >
              {isRoomPost ? (
                <span className="flex items-center gap-1.5">
                  <span>OPEN ROOM</span>
                  <span className="text-sm">↗</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span>VIEW CONTACT</span>
                  <span className="text-sm">↗</span>
                </span>
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-sm border-2 border-black bg-black/40 px-3 py-1.5 text-xs font-bold text-white/30 shadow-[1px_1px_0_#000]"
            >
              {post.status === "CLOSED" ? "Post Closed" : "Expired"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}