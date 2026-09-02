"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PostCard from "@/components/buzz/PostCard";
import CreatePostForm from "@/components/buzz/CreatePostForm";
import { mockPosts } from "@/data/mockData";
import { Hashtag, Post } from "@/types";
import { getPosts } from "@/lib/api";

const filters: ("ALL" | Hashtag)[] = [
  "ALL",
  "#foodsplit",
  "#cabsplit",
  "#resell",
  "#lost",
  "#found",
];

export default function BuzzPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [selectedFilter, setSelectedFilter] =
    useState<"ALL" | Hashtag>("ALL");
  const [showCreatePost, setShowCreatePost] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadPosts() {
      setIsLoading(true);
      try {
        const fetchedPosts = await getPosts();
        if (Array.isArray(fetchedPosts) && fetchedPosts.length > 0) {
          setPosts(fetchedPosts);
        }
      } catch (err) {
        console.warn("Backend API unavailable, using mock posts fallback:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadPosts();
  }, []);

  const filteredPosts =
    selectedFilter === "ALL"
      ? posts
      : posts.filter(
          (post) => post.hashtag === selectedFilter
        );

  /*function handlePostAction(post: Post) {
    if (
      post.hashtag === "#foodsplit" ||
      post.hashtag === "#cabsplit" ||
      post.hashtag === "#resell"
    ) {
      alert(`Opening room for ${post.title}`);
      return;
    }

    if (
      post.hashtag === "#lost" ||
      post.hashtag === "#found"
    ) {
      alert(
        `Contact: ${
          post.contact ?? "No contact information available"
        }`
      );
    }
  }*/
 function handlePostAction(post: Post) {
  if (
    post.hashtag === "#foodsplit" ||
    post.hashtag === "#cabsplit" ||
    post.hashtag === "#resell"
  ) {
    router.push(`/rooms?postId=${encodeURIComponent(post.id)}`);
    return;
  }

  if (
    post.hashtag === "#lost" ||
    post.hashtag === "#found"
  ) {
    if (post.contact) {
      alert(`Contact: ${post.contact}`);
    } else {
      alert("No contact information available.");
    }
  }
}

  function handleCreatePostClose() {
    setShowCreatePost(false);
  }

  function handlePostCreated(newPost: Post) {
    setPosts((current) => [newPost, ...current]);
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Campus Buzz
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            What&apos;s happening around campus?
          </p>
        </div>

        <button
          onClick={() => setShowCreatePost(true)}
          className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 shadow-sm cursor-pointer"
        >
          + Create Buzz
        </button>
      </div>

      {/* Hashtag Filters */}
      <div className="mb-8 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isSelected =
            selectedFilter === filter;

          return (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition cursor-pointer ${
                isSelected
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-100"
              }`}
            >
              {filter === "ALL" ? "All" : filter}
            </button>
          );
        })}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="mb-4 text-sm text-gray-500">Refreshing posts from server...</div>
      )}

      {/* Posts */}
      {filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            No posts found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            There are no posts for this hashtag yet.
          </p>

          <button
            onClick={() => setShowCreatePost(true)}
            className="mt-5 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 cursor-pointer"
          >
            Create the first Buzz
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onAction={handlePostAction}
            />
          ))}
        </div>
      )}

      {/* Create Buzz Modal */}
      {showCreatePost && (
        <CreatePostForm
          onClose={handleCreatePostClose}
          onPostCreated={handlePostCreated}
        />
      )}
    </main>
  );
}
