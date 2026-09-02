"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import PostCard from "@/components/buzz/PostCard";
import CreatePostForm from "@/components/buzz/CreatePostForm";
import { Hashtag, Post } from "@/types";
import {
  getPosts,
  getPostContact,
} from "@/lib/api";

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

  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedFilter, setSelectedFilter] =
    useState<"ALL" | Hashtag>("ALL");

  const [showCreatePost, setShowCreatePost] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPosts() {
      try {
        setError("");

        const fetchedPosts = await getPosts();
        setPosts(fetchedPosts);
      } catch (err) {
        console.error("Failed to load posts:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load Campus Buzz posts."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadPosts();
  }, []);

  const filteredPosts =
    selectedFilter === "ALL"
      ? posts
      : posts.filter((post) =>
          post.hashtags.includes(selectedFilter)
        );

        async function handlePostAction(post: Post) {
          if (
            post.interactionType === "FOOD_SPLIT" ||
            post.interactionType === "CAB_SPLIT" ||
            post.interactionType === "RESELL"
          ) {
            router.push(
              `/rooms?postId=${encodeURIComponent(post.id)}`
            );
            return;
          }
        
          if (
            post.interactionType === "LOST" ||
            post.interactionType === "FOUND"
          ) {
            try {
              const contact =
                await getPostContact(post.id);
        
              alert(
                `Contact: ${contact.contactName}\n${contact.contactPhone}`
              );
            } catch (err) {
              console.error(
                "Failed to fetch contact:",
                err
              );
        
              alert(
                err instanceof Error
                  ? err.message
                  : "Unable to fetch contact information."
              );
            }
          }
        }
  function handlePostCreated(newPost: Post) {
    setPosts((current) => [
      newPost,
      ...current,
    ]);

    setShowCreatePost(false);
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
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
          onClick={() =>
            setShowCreatePost(true)
          }
          className="cursor-pointer rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
        >
          + Create Buzz
        </button>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isSelected =
            selectedFilter === filter;

          return (
            <button
              key={filter}
              onClick={() =>
                setSelectedFilter(filter)
              }
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition ${
                isSelected
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-100"
              }`}
            >
              {filter === "ALL"
                ? "All"
                : filter}
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="mb-4 text-sm text-gray-500">
          Loading Campus Buzz...
        </div>
      )}

      {error && !isLoading && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isLoading &&
      !error &&
      filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            No posts found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            There are no posts for this
            hashtag yet.
          </p>

          <button
            onClick={() =>
              setShowCreatePost(true)
            }
            className="mt-5 cursor-pointer rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
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

      {showCreatePost && (
        <CreatePostForm
          onClose={() =>
            setShowCreatePost(false)
          }
          onPostCreated={handlePostCreated}
        />
      )}
    </main>
  );
}