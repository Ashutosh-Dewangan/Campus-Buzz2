"use client";

import { useCallback, useEffect, useState } from "react";
import OfficialPostCard from "@/components/official/OfficialPostCard";
import CreateOfficialPost from "@/components/official/CreateOfficialPost";
import { OfficialPost } from "@/types";
import { getOfficialPosts } from "@/lib/api";
import { canCreateOfficialPost } from "@/lib/auth";
import { useCurrentUser } from "@/lib/session";

export default function OfficialPage() {
  const [posts, setPosts] = useState<OfficialPost[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const user = useCurrentUser();
  const canPost = user ? canCreateOfficialPost(user.role) : false;

  const loadOfficialPosts = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const fetched = await getOfficialPosts();
      if (Array.isArray(fetched)) {
        setPosts(fetched);
      }
    } catch {
      setError("We couldn't load official announcements right now.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function fetchInitial() {
      try {
        const fetched = await getOfficialPosts();
        if (!ignore && Array.isArray(fetched)) {
          setPosts(fetched);
        }
      } catch {
        if (!ignore) {
          setError("We couldn't load official announcements right now.");
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

  function handlePostCreated(newPost: OfficialPost) {
    setPosts((current) => [newPost, ...current]);
    setShowCreatePost(false);
  }

  return (
    <main className="comic-page">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="comic-title">Official Campus</h1>
              <span className="tag-pill tag-cab">Verified</span>
            </div>

            <p className="comic-sub">
              Announcements, events and official campus communication.
            </p>
          </div>

          {/* Only render this button for authorized roles */}
          {canPost && (
            <button
              type="button"
              onClick={() => setShowCreatePost(true)}
              className="comic-btn"
            >
              + Post Notice
            </button>
          )}
        </div>

        {/* Error state */}
        {error && !isLoading && (
          <div className="comic-card comic-empty mb-6">
            <p style={{ color: "var(--accent)", fontWeight: 800 }}>Failed to load announcements</p>
            <p className="comic-sub">{error}</p>
            <button
              type="button"
              onClick={loadOfficialPosts}
              className="comic-btn mt-4"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="mb-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="comic-card h-56 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Posts List */}
        {!isLoading && !error && posts.length === 0 ? (
          <div className="comic-card comic-empty">
            <h2 className="stay-loop-title">No official announcements</h2>
            <p className="comic-sub mx-auto max-w-md">
              No notices have been published yet. Check back soon for administrative announcements.
            </p>
            {canPost && (
              <button
                type="button"
                onClick={() => setShowCreatePost(true)}
                className="comic-btn mt-5"
              >
                Post Notice
              </button>
            )}
          </div>
        ) : (
          !isLoading && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <OfficialPostCard key={post.id} post={post} />
              ))}
            </div>
          )
        )}

        {/* Create Official Post Modal */}
        {canPost && showCreatePost && (
          <CreateOfficialPost
            onClose={() => setShowCreatePost(false)}
            onPostCreated={handlePostCreated}
          />
        )}
      </div>
    </main>
  );
}
