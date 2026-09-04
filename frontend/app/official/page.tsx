"use client";

import { useEffect, useState } from "react";
import OfficialPostCard from "@/components/official/OfficialPostCard";
import CreateOfficialPost from "@/components/official/CreateOfficialPost";
import { mockOfficialPosts } from "@/data/mockData";
import { OfficialPost, UserRole } from "@/types";
import { getOfficialPosts } from "@/lib/api";
import { canCreateOfficialPost } from "@/lib/auth";


export default function OfficialPage() {
  const [posts, setPosts] = useState<OfficialPost[]>(mockOfficialPosts);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadOfficialPosts() {
      setIsLoading(true);
      try {
        const fetched = await getOfficialPosts();
        if (Array.isArray(fetched) && fetched.length > 0) {
          setPosts(fetched);
        }
      } catch (err) {
        console.warn("Backend API unavailable, using mock official posts fallback:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadOfficialPosts();
  }, []);

  function handlePostCreated(newPost: OfficialPost) {
    setPosts((current) => [newPost, ...current]);
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

          <button
            type="button"
            onClick={() => setShowCreatePost(true)}
            className="comic-btn"
          >
            + Post Notice
          </button>
        </div>

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
        {!isLoading && posts.length === 0 ? (
          <div className="comic-card comic-empty">
            <h2 className="stay-loop-title">No official announcements</h2>
            <p className="comic-sub mx-auto max-w-md">
              No notices have been published yet. Check back soon for administrative announcements.
            </p>
            <button
              type="button"
              onClick={() => setShowCreatePost(true)}
              className="comic-btn mt-5"
            >
              Post Notice
            </button>
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
        {showCreatePost && (
          <CreateOfficialPost
            onClose={() => setShowCreatePost(false)}
            onPostCreated={handlePostCreated}
          />
        )}
      </div>
    </main>
  );
}
