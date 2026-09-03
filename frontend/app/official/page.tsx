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
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Official Campus
              </h1>

              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                Verified
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Announcements, events and official campus communication.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreatePost(true)}
            className="cursor-pointer rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
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
                className="h-56 animate-pulse rounded-2xl border bg-white shadow-sm"
              />
            ))}
          </div>
        )}

        {/* Posts List */}
        {!isLoading && posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center sm:p-14">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
              📋
            </div>
            <h2 className="mt-5 text-lg font-semibold text-gray-900">
              No official announcements
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              No notices have been published yet. Check back soon for administrative announcements.
            </p>
            <button
              type="button"
              onClick={() => setShowCreatePost(true)}
              className="mt-5 cursor-pointer rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
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
