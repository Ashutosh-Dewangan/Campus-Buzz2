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
  { label: "#CASSPLIT",  value: "#cabsplit",  cls: "tag-cab"    },
  { label: "#RESELL",    value: "#resell",    cls: "tag-resell" },
  { label: "#LOST",      value: "#lost",      cls: "tag-lost"   },
  { label: "#FOUND",     value: "#found",     cls: "tag-found"  },
];

const rightFilters = ["CLUBS", "DEVELOPERS", "LEADS"];

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

  const minutesAgo = Math.round(
    (Date.now() - new Date(post.createdAt).getTime()) / 60000
  );
  const joined = Math.floor(Math.random() * 15) + 2;

  return (
    <div className="feed-card cb-fade-up">
      {/* Spider web decoration */}
      <SpiderWeb />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Tag */}
        <div className="feed-card-tag">{primaryTag}</div>

        {/* Title */}
        <h2 className="feed-card-title">{post.title}</h2>

        {/* Description */}
        <p className="feed-card-desc">{post.description}</p>

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
            {joined} joined · posted {minutesAgo} min ago
          </div>

          {/* Actions */}
          {post.status === "ACTIVE" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 6,
              }}
            >
              {isRoomPost && (
                <span className="join-badge">
                  {Math.floor(Math.random() * 8) + 2} John Idk
                </span>
              )}
              {post.expiresAt && (
                <span className="time-badge">
                  {Math.floor(Math.random() * 6) + 1}h left
                </span>
              )}
              <button
                className="retro-btn"
                onClick={() => onAction(post)}
                style={{ fontSize: 10, padding: "4px 10px" }}
              >
                {isRoomPost ? "OPEN ROOM" : "VIEW CONTACT"}
              </button>
            </div>
          )}
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
  const [activeRightFilter, setActiveRightFilter] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
    loadPosts();
  }, [loadPosts]);

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
          const contact = await getPostContact(post.id);
          alert(`Contact: ${contact.contactName}\nPhone: ${contact.contactPhone}`);
        } catch {
          alert("Unable to retrieve contact information.");
        }
        break;
    }
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts((cur) => [newPost, ...cur]);
    setShowCreatePost(false);
  };

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
            <div className="buzz-subtitle">The Campus, In Real Time.</div>
          </div>
        </div>

        {/* Filter pills + right filter buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div className="filter-tag-row" style={{ margin: 0, gap: 6 }}>
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

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--fg-muted)",
              }}
            >
              FILTER
            </span>
            {rightFilters.map((rf) => (
              <button
                key={rf}
                className={`filter-pill${activeRightFilter === rf ? " filter-pill--active" : ""}`}
                onClick={() =>
                  setActiveRightFilter(activeRightFilter === rf ? "" : rf)
                }
                type="button"
              >
                {rf}
              </button>
            ))}
          </div>
        </div>

        {/* Post creator */}
        <div className="post-creator">
          <div className="post-creator-title">What's happening on Campus?</div>
          <div className="post-creator-sub">
            Add a photo, title, description • #hashtag
          </div>
          <div className="post-creator-actions">
            <button className="retro-btn-outline" type="button">
              📷 PHOTO
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
              Be the first to post in this category.
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
        <CampusPulse />
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
    </div>
  );
}