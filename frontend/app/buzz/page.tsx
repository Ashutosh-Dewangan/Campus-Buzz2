"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import CreatePostForm from "@/components/buzz/CreatePostForm";
import CampusPulse from "@/components/buzz/CampusPulse";

import { getPostContact, getPosts } from "@/lib/api";
import { Post } from "@/types";

/* ---------- Filter config ---------- */
const filters = [
  { label: "ALL",       value: "ALL",        cls: "tag-all"    },
  { label: "#FOODSPLIT", value: "#foodsplit", cls: "tag-food"   },
  { label: "#CABSPLIT",  value: "#cabsplit",  cls: "tag-cab"    },
  { label: "#RESELL",    value: "#resell",    cls: "tag-resell" },
  { label: "#LOST",      value: "#lost",      cls: "tag-lost"   },
  { label: "#FOUND",     value: "#found",     cls: "tag-found"  },
];

/* ---------- Remaining time helper ---------- */
function getRemainingTime(expiresAt: string): string | null {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return null;

  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return remHours > 0 ? `${days}d ${remHours}h left` : `${days}d left`;
  }
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

/* ---------- Spider web SVG ---------- */
function SpiderWeb() {
  return (
    <svg
      className="spider-web-deco"
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 8;
        const x = 80 + 75 * Math.cos(angle);
        const y = 80 + 75 * Math.sin(angle);
        return (
          <line
            key={i}
            x1="80" y1="80" x2={x} y2={y}
            stroke="currentColor" strokeWidth="1"
          />
        );
      })}
      {[20, 38, 56, 74].map((r, i) => (
        <circle
          key={i} cx="80" cy="80" r={r}
          stroke="currentColor" strokeWidth="1" fill="none"
        />
      ))}
    </svg>
  );
}

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
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(4px)",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="comic-modal"
        style={{ padding: "20px 24px", maxWidth: 380 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontSize: 20,
              color: "var(--accent)",
              letterSpacing: "0.04em",
            }}
          >
            Contact Info
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 22,
              color: "var(--fg-muted)",
              cursor: "pointer",
              lineHeight: 1,
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "2px solid #000",
              padding: "10px 14px",
            }}
          >
            <p style={{ fontSize: 10, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
              Name
            </p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--fg)" }}>
              {contactName}
            </p>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "2px solid #000",
              padding: "10px 14px",
            }}
          >
            <p style={{ fontSize: 10, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
              Phone
            </p>
            <a
              href={`tel:${contactPhone}`}
              style={{ fontSize: 15, fontWeight: 700, color: "var(--neon-cyan)", textDecoration: "none" }}
            >
              {contactPhone}
            </a>
          </div>
        </div>

        <button
          type="button"
          className="retro-btn"
          onClick={onClose}
          style={{ marginTop: 16, width: "100%" }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* ---------- Individual post card ---------- */
function FeedCard({
  post,
  onAction,
}: {
  post: Post;
  onAction: (post: Post) => void;
}) {
  const primaryTag = post.hashtags[0] || "#campus";
  const isRoomPost = ["FOOD_SPLIT", "CAB_SPLIT", "RESELL"].includes(
    post.interactionType
  );

  const [timeDisplay, setTimeDisplay] = useState(() => {
    const now = Date.now();
    const minutesAgo = Math.max(0, Math.round(
      (now - new Date(post.createdAt).getTime()) / 60000
    ));
    const ago =
      minutesAgo < 1 ? "just now"
      : minutesAgo < 60 ? `${minutesAgo}m ago`
      : minutesAgo < 1440 ? `${Math.floor(minutesAgo / 60)}h ago`
      : `${Math.floor(minutesAgo / 1440)}d ago`;

    let remaining = "";
    let expired = false;
    if (post.expiresAt) {
      const r = getRemainingTime(post.expiresAt);
      if (r) remaining = r;
      else expired = true;
    }

    return { ago, remaining, expired };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const minutesAgo = Math.max(0, Math.round(
        (now - new Date(post.createdAt).getTime()) / 60000
      ));
      const ago =
        minutesAgo < 1 ? "just now"
        : minutesAgo < 60 ? `${minutesAgo}m ago`
        : minutesAgo < 1440 ? `${Math.floor(minutesAgo / 60)}h ago`
        : `${Math.floor(minutesAgo / 1440)}d ago`;

      let remaining = "";
      let expired = false;
      if (post.expiresAt) {
        const r = getRemainingTime(post.expiresAt);
        if (r) remaining = r;
        else expired = true;
      }

      setTimeDisplay({ ago, remaining, expired });
    }, 60000);

    return () => clearInterval(interval);
  }, [post.createdAt, post.expiresAt]);

  const { ago, remaining, expired } = timeDisplay;
  const effectivelyActive = post.status === "ACTIVE" && !expired;

  return (
    <div className="feed-card cb-fade-up">
      {/* Spider web decoration */}
      <SpiderWeb />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Post image */}
        {post.image && (
          <div
            style={{
              width: "100%",
              height: 160,
              overflow: "hidden",
              border: "2px solid #000",
              marginBottom: 10,
              position: "relative",
            }}
          >
            <img
              src={post.image}
              alt={post.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            {/* Tag overlay on image */}
            <span
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                background: "rgba(10,7,24,0.85)",
                border: "2px solid #000",
                color: "var(--neon-cyan)",
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "2px 8px",
              }}
            >
              {primaryTag}
            </span>
          </div>
        )}

        {/* Tag (if no image) */}
        {!post.image && (
          <div className="feed-card-tag">{primaryTag}</div>
        )}

        {/* Title */}
        <h2 className="feed-card-title">{post.title}</h2>

        {/* Description */}
        <p className="feed-card-desc">{post.description}</p>

        {/* All hashtags */}
        {post.hashtags.length > 1 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
            {post.hashtags.slice(1).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: "var(--fg-muted)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginTop: 12,
          }}
        >
          {/* Meta */}
          <div className="feed-card-meta">
            <span style={{ fontWeight: 700, color: "var(--fg)" }}>
              {post.author}
            </span>
            {ago ? ` · ${ago}` : ""}
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 6,
            }}
          >
            {/* Expiry badge */}
            {remaining && (
              <span className="time-badge">{remaining}</span>
            )}
            {expired && (
              <span
                className="time-badge"
                style={{ background: "var(--fg-muted)", color: "#000" }}
              >
                Expired
              </span>
            )}

            {effectivelyActive && (
              <button
                className="retro-btn"
                onClick={() => onAction(post)}
                style={{ fontSize: 10, padding: "4px 10px" }}
              >
                {isRoomPost ? "OPEN ROOM" : "VIEW CONTACT"}
              </button>
            )}
            {!effectivelyActive && post.status === "CLOSED" && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: "var(--fg-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Closed
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Skeleton loader ---------- */
function SkeletonCard() {
  return (
    <div className="feed-card" style={{ minHeight: 140 }}>
      <div
        style={{
          height: 14, width: "30%", borderRadius: 3,
          background: "var(--border)", marginBottom: 8,
          animation: "pulse 1.4s ease-in-out infinite",
        }}
      />
      <div
        style={{
          height: 22, width: "75%", borderRadius: 3,
          background: "var(--border)", marginBottom: 8,
        }}
      />
      <div
        style={{
          height: 14, width: "90%", borderRadius: 3,
          background: "var(--border)",
        }}
      />
    </div>
  );
}

/* ---------- Main page ---------- */
export default function BuzzPage() {
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

  const filteredPosts = useMemo(() => {
    if (selectedFilter === "ALL") return posts;
    return posts.filter((p) => p.hashtags.includes(selectedFilter));
  }, [posts, selectedFilter]);

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
  };

  // Empty state label for current filter
  const emptyLabel = useMemo(() => {
    switch (selectedFilter) {
      case "#foodsplit": return "No active food splits right now.";
      case "#cabsplit": return "No active cab splits right now.";
      case "#resell": return "Nothing listed for resale yet.";
      case "#lost": return "No lost items reported.";
      case "#found": return "No found items reported.";
      default: return "No posts yet. Be the first to post!";
    }
  }, [selectedFilter]);

  return (
    <div className="buzz-layout">
      <div className="buzz-wordcloud" aria-hidden="true">
        <span style={{ top: "12%", left: "28%", fontSize: 54 }}>FACULTY</span>
        <span style={{ top: "22%", right: "18%", fontSize: 36, color: "rgba(42,240,255,0.28)" }}>GRAD 2026</span>
        <span style={{ top: "38%", left: "8%", fontSize: 42 }}>EXAMS</span>
        <span style={{ top: "48%", right: "32%", fontSize: 28 }}>SYLLABUS</span>
        <span style={{ bottom: "22%", left: "18%", fontSize: 32, color: "rgba(255,225,74,0.3)" }}>HOSTEL</span>
        <span className="sfx" style={{ top: "8%", right: "38%", color: "#ffe14a", fontSize: 72, transform: "rotate(-8deg)" }}>ZAP!</span>
        <span className="sfx" style={{ bottom: "18%", right: "12%", color: "#2af0ff", fontSize: 64, transform: "rotate(6deg)" }}>CRASH!</span>
      </div>

      {/* ===== CENTER COLUMN ===== */}
      <div className="buzz-center">

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div>
            <div className="buzz-title">CAMPUS BUZZ</div>
            <div className="buzz-subtitle">What&apos;s happening on campus?</div>
          </div>
        </div>

        {/* Filter pills */}
        <div className="filter-tag-row" style={{ marginBottom: 14 }}>
          {filters.map((f) => (
            <button
              key={f.value}
              className={`tag-pill ${f.cls}${selectedFilter === f.value ? " tag-pill--active" : ""}`}
              onClick={() => setSelectedFilter(f.value)}
              type="button"
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Post creator */}
        <div className="post-creator">
          <div className="post-creator-title">What&apos;s on your mind?</div>
          <div className="post-creator-sub">
            Add a photo · title · description · #hashtag
          </div>
          <div className="post-creator-actions">
            <button
              className="retro-btn-outline"
              type="button"
              onClick={() => setShowCreatePost(true)}
            >
              📷 Photo
            </button>
            <button
              className="pow-btn"
              type="button"
              onClick={() => setShowCreatePost(true)}
            >
              POST
            </button>
          </div>
        </div>

        {/* Contact loading indicator */}
        {contactLoading && (
          <div className="feed-card" style={{ padding: "12px 16px", marginBottom: 8, textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "var(--fg-muted)" }}>
              Fetching contact info…
            </p>
          </div>
        )}
        {contactError && (
          <div className="feed-card" style={{ padding: "12px 16px", marginBottom: 8, borderColor: "var(--accent)" }}>
            <p style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700 }}>
              {contactError}
            </p>
          </div>
        )}

        {/* Feed */}
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : error ? (
          <div className="feed-card" style={{ textAlign: "center", padding: 32 }}>
            <p style={{ color: "var(--accent)", fontWeight: 800 }}>
              Something went wrong
            </p>
            <p style={{ fontSize: 12, color: "var(--fg-muted)", margin: "8px 0 16px" }}>
              {error}
            </p>
            <button className="retro-btn" onClick={loadPosts}>
              Try again
            </button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div
            className="feed-card"
            style={{ textAlign: "center", padding: 40 }}
          >
            <div style={{ fontSize: 32, marginBottom: 10 }}>✦</div>
            <p style={{ fontWeight: 800, color: "var(--fg)" }}>
              Nothing here yet
            </p>
            <p style={{ fontSize: 12, color: "var(--fg-muted)", margin: "6px 0 16px" }}>
              {emptyLabel}
            </p>
            <button
              className="retro-btn"
              onClick={() => setShowCreatePost(true)}
            >
              Create a Buzz
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <FeedCard
              key={post.id}
              post={post}
              onAction={handlePostAction}
            />
          ))
        )}
      </div>

      {/* ===== RIGHT COLUMN ===== */}
      <div className="buzz-right">
        <CampusPulse posts={posts} />
      </div>

      {/* ===== CREATE POST MODAL ===== */}
      {showCreatePost && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
            padding: 16,
          }}
        >
          <div className="comic-modal">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderBottom: "1.5px solid var(--border)",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--accent)",
                  }}
                >
                  Create a Buzz
                </h2>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: 11,
                    color: "var(--fg-muted)",
                  }}
                >
                  Start a conversation on campus.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreatePost(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 22,
                  color: "var(--fg-muted)",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div style={{ padding: "16px 20px" }}>
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