"use client";

import { useEffect, useState } from "react";
import OfficialPostCard from "@/components/official/OfficialPostCard";
import CreateOfficialPost from "@/components/official/CreateOfficialPost";
import { mockOfficialPosts } from "@/data/mockData";
import { OfficialPost } from "@/types";
import { getOfficialPosts } from "@/lib/api";

export default function OfficialPage() {
  const [posts, setPosts] = useState<OfficialPost[]>(mockOfficialPosts);
  const [showCreateModal, setShowCreateModal] = useState(false);
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
    <main className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Official Notices & Announcements
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Verified updates directly from college administration, departments, and registered clubs.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 shadow-sm cursor-pointer"
        >
          + Post Notice
        </button>
      </div>

      {isLoading && (
        <div className="mb-4 text-sm text-gray-500">Refreshing notices from server...</div>
      )}

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <h2 className="text-lg font-semibold text-gray-900">No official announcements</h2>
          <p className="mt-2 text-sm text-gray-500">No notices have been published yet.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-5 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 cursor-pointer"
          >
            Post Notice
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <OfficialPostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Create Official Post Modal */}
      {showCreateModal && (
        <CreateOfficialPost
          onClose={() => setShowCreateModal(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </main>
  );
}
