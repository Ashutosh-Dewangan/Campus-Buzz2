"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import CreatePostForm from "@/components/buzz/CreatePostForm";
import CampusPulse from "@/components/buzz/CampusPulse";
import PostCard from "@/components/buzz/PostCard";

import { getPostContact, getPosts, getTrendingTags } from "@/lib/api";
import { Post } from "@/types";
import {
  AlertCircleIcon,
  CarIcon,
  SearchIcon,
  SparkIcon,
  TagIcon,
  UserIcon,
  UtensilsIcon,
} from "@/components/ui/Icons";

/* ---------- Filter config ---------- */
const filters = [
  { label: "ALL",        value: "ALL",        tag: "#all"       },
  { label: "#FOODSPLIT", value: "#foodsplit", tag: "#foodsplit" },
  { label: "#CABSPLIT",  value: "#cabsplit",  tag: "#cabsplit"  },
  { label: "#RESELL",    value: "#resell",    tag: "#resell"    },
  { label: "#LOST",      value: "#lost",      tag: "#lost"      },
  { label: "#FOUND",     value: "#found",     tag: "#found"     },
];

/* ---------- Contact info modal ---------- */
function ContactModal({
  onClose,
  contactName,
  contactPhone,
}: {
  onClose: () => void;
  contactName: string;
  contactPhone: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(contactPhone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="comic-modal w-full max-w-sm rounded-sm p-5 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-sm border-2 border-black bg-[var(--neon-cyan)] text-black shadow-[2px_2px_0_#000]">
              <UserIcon className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Poster Contact Details
              </h2>
              <span className="text-[10px] font-semibold text-emerald-400">
                ✓ Verified Campus Student
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-xl font-bold text-[var(--fg-muted)] hover:text-white"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="my-4 space-y-3">
          {/* Name */}
          <div className="rounded-sm border-2 border-black bg-[rgba(8,6,20,0.85)] p-3 shadow-[2px_2px_0_#000]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              Poster Name / Location
            </p>
            <p className="mt-1 text-sm font-bold text-white">
              {contactName || "Campus Student"}
            </p>
          </div>

          {/* Phone */}
          <div className="rounded-sm border-2 border-black bg-[rgba(8,6,20,0.85)] p-3 shadow-[2px_2px_0_#000]">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                Phone / WhatsApp
              </p>
              <button
                type="button"
                onClick={handleCopy}
                className="cursor-pointer text-[10px] font-bold text-[var(--neon-cyan)] hover:underline"
              >
                {copied ? "Copied! ✓" : "Copy"}
              </button>
            </div>
            <a
              href={`tel:${contactPhone}`}
              className="mt-1 block text-base font-black text-[var(--neon-cyan)] hover:underline"
            >
              {contactPhone}
            </a>
          </div>

          {/* Campus safety note */}
          <div className="font-readable rounded-sm border border-black/60 bg-amber-500/10 p-2.5 text-[11px] text-amber-200/90 leading-tight">
            <span className="font-bold">Campus Safety:</span> For item handoffs, meet in public, well-lit campus spots such as the student center, library lawn, or dining hall.
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2">
          <a
            href={`tel:${contactPhone}`}
            className="retro-btn flex-1 text-center text-xs font-black"
          >
            Call Poster ↗
          </a>
          <button
            type="button"
            onClick={onClose}
            className="retro-btn-outline flex-1 cursor-pointer text-center text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Skeleton loader ---------- */
function SkeletonCard() {
  return (
    <div className="feed-card animate-pulse space-y-3 p-4 sm:p-5">
      <div className="flex items-center justify-between border-b border-black/40 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-sm border-2 border-black bg-white/10" />
          <div className="space-y-1">
            <div className="h-3 w-24 rounded-sm bg-white/15" />
            <div className="h-2 w-16 rounded-sm bg-white/10" />
          </div>
        </div>
        <div className="h-4 w-14 rounded-sm bg-white/10" />
      </div>

      <div className="aspect-[16/9] w-full rounded-sm border-2 border-black bg-white/5" />

      <div className="space-y-1.5 pt-1">
        <div className="h-4 w-4/5 rounded-sm bg-white/15" />
        <div className="h-4 w-1/2 rounded-sm bg-white/10" />
      </div>

      <div className="space-y-1.5 pt-1">
        <div className="h-3 w-full rounded-sm bg-white/10" />
        <div className="h-3 w-3/4 rounded-sm bg-white/10" />
      </div>

      <div className="flex items-center justify-between border-t border-black/40 pt-3">
        <div className="h-5 w-24 rounded-sm bg-white/10" />
        <div className="h-7 w-28 rounded-sm border-2 border-black bg-white/15" />
      </div>
    </div>
  );
}

/* ---------- Main page ---------- */
export default function BuzzPage() {
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [activeTrendingTag, setActiveTrendingTag] = useState<string | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Contact modal state
  const [contactModal, setContactModal] = useState<{
    contactName: string;
    contactPhone: string;
  } | null>(null);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState("");

  const loadPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await getPosts();
      setPosts(data);
    } catch (err) {
      console.error(err);
      setError("We couldn't load the campus feed right now.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function fetchInitial() {
      try {
        const data = await getPosts();
        if (!ignore) {
          setPosts(data);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) {
          setError("We couldn't load the campus feed right now.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchInitial();
    return () => {
      ignore = true;
    };
  }, []);

  const trendingTags = useMemo(() => {
    return getTrendingTags(posts);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let result = posts;

    // Apply main hashtag filter if set
    if (selectedFilter !== "ALL") {
      result = result.filter((p) => p.hashtags.includes(selectedFilter));
    }

    // Apply trending tag filter if active
    if (activeTrendingTag) {
      result = result.filter((p) =>
        p.hashtags.some(
          (t) => t.toLowerCase() === activeTrendingTag.toLowerCase()
        )
      );
    }

    return result;
  }, [posts, selectedFilter, activeTrendingTag]);

  const handlePostAction = async (post: Post) => {
    if (post.status === "CLOSED") return;
    switch (post.interactionType) {
      case "FOOD_SPLIT":
      case "CAB_SPLIT":
      case "RESELL":
        router.push(`/rooms?postId=${post.id}`);
        break;
      case "LOST":
      case "FOUND":
        try {
          setContactLoading(true);
          setContactError("");
          const contact = await getPostContact(post.id);
          setContactModal(contact);
        } catch {
          setContactError("Unable to retrieve contact information. Please try again.");
        } finally {
          setContactLoading(false);
        }
        break;
    }
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts((cur) => [newPost, ...cur]);
    setShowCreatePost(false);
    setToastMessage("✓ Buzz posted! Your coordination is live on campus.");
    setTimeout(() => setToastMessage(""), 4000);
  };

  const emptyLabel = useMemo(() => {
    if (activeTrendingTag) {
      return `No active posts matching ${activeTrendingTag}.`;
    }
    switch (selectedFilter) {
      case "#foodsplit":
        return "No food splits right now.";
      case "#cabsplit":
        return "No cab splits right now.";
      case "#resell":
        return "No items being resold right now.";
      case "#lost":
        return "No lost-item posts right now.";
      case "#found":
        return "No found-item posts right now.";
      default:
        return "No campus buzz yet. Be the first to start something.";
    }
  }, [selectedFilter, activeTrendingTag]);

  return (
    <div className="buzz-layout">
      {/* ===== CENTER COLUMN ===== */}
      <div className="buzz-center">
        {/* Header */}
        <header className="mb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <h1 className="buzz-title">CAMPUS BUZZ</h1>
              <span className="rounded-sm border-2 border-black bg-[var(--accent)] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-[2px_2px_0_#000]">
                Live Feed
              </span>
            </div>
            <p className="text-xs font-semibold tracking-wide text-[var(--fg-muted)] sm:text-sm">
              The verified student feed for ride splits, food sharing, resale, and campus recovery.
            </p>
          </div>
        </header>

        {/* Filter Navigation Bar (Horizontally scrollable on mobile) */}
        <nav
          aria-label="Feed filters"
          className="mb-3 overflow-x-auto pb-1 text-xs scrollbar-none"
        >
          <div className="flex min-w-max items-center gap-2">
            {filters.map((f) => {
              const isActive = selectedFilter === f.value;
              const count =
                f.value === "ALL"
                  ? posts.length
                  : posts.filter((p) => p.hashtags.includes(f.value)).length;

              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => {
                    setSelectedFilter(f.value);
                    setActiveTrendingTag(null);
                  }}
                  style={{
                    borderColor: isActive ? "black" : "rgba(0,0,0,0.8)",
                    boxShadow: isActive ? "3px 3px 0 #000" : "1px 1px 0 #000",
                  }}
                  className={`flex shrink-0 cursor-pointer items-center rounded-sm border-2 px-3 py-1.5 text-xs font-bold tracking-wider uppercase transition-all duration-150 ${
                    isActive
                      ? "bg-[var(--accent)] text-white shadow-[2px_2px_0_#000]"
                      : "bg-[rgba(14,10,28,0.7)] text-[var(--fg-muted)] hover:border-white/40 hover:text-white"
                  }`}
                >
                  <span>{f.label}</span>
                  {count > 0 && (
                    <span
                      className={`ml-1.5 rounded-sm px-1 py-0.2 text-[10px] font-black ${
                        isActive
                          ? "bg-black/40 text-white"
                          : "bg-black/60 text-[var(--fg-muted)]"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Trending Tags Strip */}
        {trendingTags.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--neon-yellow)]">
              Trending:
            </span>
            {trendingTags.map(({ tag, count }) => {
              const isSelected = activeTrendingTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    setActiveTrendingTag((cur) => (cur === tag ? null : tag))
                  }
                  className={`cursor-pointer rounded-sm border px-2 py-0.5 text-[10px] font-bold transition-all ${
                    isSelected
                      ? "border-[var(--neon-cyan)] bg-[var(--neon-cyan)] text-black shadow-[1px_1px_0_#000]"
                      : "border-black/60 bg-black/40 text-[var(--fg-muted)] hover:border-white/40 hover:text-white"
                  }`}
                >
                  {tag} <span className="opacity-60">({count})</span>
                </button>
              );
            })}
            {activeTrendingTag && (
              <button
                type="button"
                onClick={() => setActiveTrendingTag(null)}
                className="cursor-pointer text-[10px] font-bold text-[var(--accent)] hover:underline ml-1"
              >
                ✕ Clear tag
              </button>
            )}
          </div>
        )}

        {/* Success Toast */}
        {toastMessage && (
          <div className="mb-4 flex items-center justify-between rounded-sm border-2 border-black bg-[rgba(0,229,200,0.15)] p-3 text-xs font-bold text-emerald-300 shadow-[3px_3px_0_#000]">
            <span>{toastMessage}</span>
            <button
              type="button"
              onClick={() => setToastMessage("")}
              className="text-white/60 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Post Creator Action Bar */}
        <div className="mb-4 rounded-sm border-3 border-black bg-gradient-to-r from-[rgba(26,18,52,0.95)] to-[rgba(14,10,32,0.95)] p-3.5 shadow-[4px_4px_0_#000]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border-2 border-black bg-[var(--accent)] shadow-[2px_2px_0_#000]">
                <SparkIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  Coordinate with campus peers
                </p>
                <p className="font-readable text-xs text-[var(--fg-muted)]">
                  Need a cab partner, food split, item buyer, or lost property?
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCreatePost(true)}
              className="retro-btn shrink-0 cursor-pointer self-start sm:self-auto"
              style={{ padding: "8px 16px" }}
            >
              + Post a Buzz
            </button>
          </div>
        </div>

        {/* Contact Loading Indicator */}
        {contactLoading && (
          <div className="feed-card mb-3 py-3 text-center">
            <p className="text-xs font-semibold text-[var(--neon-cyan)]">
              Fetching verified poster contact info…
            </p>
          </div>
        )}

        {/* Contact Error Message */}
        {contactError && (
          <div className="feed-card mb-3 border-2 border-[var(--accent)] py-3 text-center">
            <p className="text-xs font-bold text-[var(--accent)]">
              {contactError}
            </p>
          </div>
        )}

        {/* Feed List */}
        {isLoading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <div className="feed-card rounded-sm border-2 border-[var(--accent)] p-8 text-center sm:p-10">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-sm border-2 border-black bg-[rgba(255,45,74,0.2)] text-xl text-[var(--accent)] shadow-[2px_2px_0_#000]">
              <AlertCircleIcon className="h-6 w-6" />
            </div>
            <p className="text-base font-bold text-white">
              Unable to load campus buzz
            </p>
            <p className="font-readable mx-auto mt-1 max-w-sm text-xs text-[var(--fg-muted)]">
              {error ||
                "We couldn't connect to the campus feed. Please check your connection and try again."}
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={loadPosts}
                className="retro-btn cursor-pointer text-xs"
              >
                Retry Connection ⟳
              </button>
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="feed-card rounded-sm p-8 text-center sm:p-12">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-sm border-2 border-black bg-[rgba(255,45,74,0.15)] shadow-[2px_2px_0_#000]">
              {selectedFilter === "#foodsplit" ? (
                <UtensilsIcon className="h-7 w-7 text-[var(--tag-food)]" />
              ) : selectedFilter === "#cabsplit" ? (
                <CarIcon className="h-7 w-7 text-[var(--tag-cab)]" />
              ) : selectedFilter === "#resell" ? (
                <TagIcon className="h-7 w-7 text-[var(--tag-resell)]" />
              ) : selectedFilter === "#lost" ? (
                <AlertCircleIcon className="h-7 w-7 text-[var(--tag-lost)]" />
              ) : selectedFilter === "#found" ? (
                <SearchIcon className="h-7 w-7 text-[var(--tag-found)]" />
              ) : (
                <SparkIcon className="h-7 w-7 text-[var(--neon-yellow)]" />
              )}
            </div>
            <p className="text-base font-bold text-white sm:text-lg">
              {emptyLabel}
            </p>
            <p className="font-readable mt-1 text-xs text-[var(--fg-muted)]">
              {selectedFilter === "ALL"
                ? "Start a split, list an item for sale, or report lost property for verified campus students."
                : `Have something related to ${selectedFilter}? Post it to connect with campus.`}
            </p>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowCreatePost(true)}
                className="retro-btn cursor-pointer"
              >
                Create a Buzz ↗
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onAction={handlePostAction}
              />
            ))}
          </div>
        )}
      </div>

      {/* ===== RIGHT COLUMN ===== */}
      <aside className="buzz-right" aria-label="Campus pulse sidebar">
        <CampusPulse posts={posts} />
      </aside>

      {/* ===== CREATE POST MODAL ===== */}
      {showCreatePost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setShowCreatePost(false)}
        >
          <div
            className="comic-modal max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-2 border-black bg-[rgba(18,10,32,0.95)] px-4 py-3 sm:px-5">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-[var(--accent)] sm:text-base">
                  Create a Buzz
                </h2>
                <p className="text-[11px] text-[var(--fg-muted)]">
                  Start a campus coordination or share an announcement.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreatePost(false)}
                className="cursor-pointer text-2xl font-bold leading-none text-[var(--fg-muted)] hover:text-white"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="p-4 sm:p-5">
              <CreatePostForm
                onPostCreated={handlePostCreated}
                onClose={() => setShowCreatePost(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ===== CONTACT MODAL ===== */}
      {contactModal && (
        <ContactModal
          contactName={contactModal.contactName}
          contactPhone={contactModal.contactPhone}
          onClose={() => setContactModal(null)}
        />
      )}
    </div>
  );
}