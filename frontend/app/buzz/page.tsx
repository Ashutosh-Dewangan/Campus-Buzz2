"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import PostCard from "@/components/buzz/PostCard";
import CreatePostForm from "@/components/buzz/CreatePostForm";

import { getPostContact, getPosts } from "@/lib/api";
import { Post } from "@/types";

const filters = [
  {
    label: "All",
    value: "ALL",
    description: "Everything happening around campus",
  },
  {
    label: "#foodsplit",
    value: "#foodsplit",
    description: "Find people to share food orders",
  },
  {
    label: "#cabsplit",
    value: "#cabsplit",
    description: "Share rides and split fares",
  },
  {
    label: "#resell",
    value: "#resell",
    description: "Buy and sell within campus",
  },
  {
    label: "#lost",
    value: "#lost",
    description: "Help find something that is missing",
  },
  {
    label: "#found",
    value: "#found",
    description: "Help return something found",
  },
];

export default function BuzzPage() {
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedFilter, setSelectedFilter] =
    useState("ALL");

  const [showCreatePost, setShowCreatePost] =
    useState(false);

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
      setError(
        "We couldn't load the campus feed right now."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const filteredPosts = useMemo(() => {
    if (selectedFilter === "ALL") {
      return posts;
    }

    return posts.filter((post) =>
      post.hashtags.includes(selectedFilter)
    );
  }, [posts, selectedFilter]);

  const activeFilter = filters.find(
    (filter) => filter.value === selectedFilter
  );

  const handlePostAction = async (post: Post) => {
    if (post.status === "CLOSED") {
      return;
    }

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

          alert(
            `Contact: ${contact.contactName}\nPhone: ${contact.contactPhone}`
          );
        } catch (err) {
          console.error(err);

          alert(
            "Unable to retrieve the poster's contact information."
          );
        }
        break;

      default:
        break;
    }
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts((currentPosts) => [
      newPost,
      ...currentPosts,
    ]);

    setShowCreatePost(false);
  };

  return (
    <main className="min-h-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="cb-page">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 py-7 shadow-sm sm:px-8 sm:py-9">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />

              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-orange-700">
                Campus Buzz
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              What&apos;s happening
              <br className="hidden sm:block" />
              around campus?
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
              Find people to coordinate with, discover
              what&apos;s happening, and make campus life a
              little easier.
            </p>

            <button
              type="button"
              onClick={() => setShowCreatePost(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
            >
              <span className="text-base">+</span>
              Create a Buzz
            </button>
          </div>

          <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-orange-100/70 blur-2xl" />

          <div className="pointer-events-none absolute -bottom-20 right-16 h-40 w-40 rounded-full bg-gray-100 blur-2xl" />
        </section>

        {/* Filters */}
        <section className="mt-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                Explore
              </p>

              <h2 className="mt-1 text-lg font-bold tracking-tight text-gray-950">
                Campus activity
              </h2>
            </div>

            {!isLoading && (
              <span className="hidden rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-500 sm:inline-flex">
                {filteredPosts.length}{" "}
                {filteredPosts.length === 1
                  ? "post"
                  : "posts"}
              </span>
            )}
          </div>

          <div className="mt-4 -mx-1 overflow-x-auto px-1 pb-1">
            <div className="flex min-w-max gap-2">
              {filters.map((filter) => {
                const isSelected =
                  selectedFilter === filter.value;

                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() =>
                      setSelectedFilter(filter.value)
                    }
                    aria-pressed={isSelected}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                      isSelected
                        ? "border-gray-950 bg-gray-950 text-white shadow-sm"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          {activeFilter && (
            <p className="mt-2 text-xs text-gray-400">
              {activeFilter.description}
            </p>
          )}
        </section>

        {/* Feed */}
        <section className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="aspect-[16/9] animate-pulse bg-gray-100" />

                  <div className="space-y-3 p-5">
                    <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />

                    <div className="h-6 w-3/4 animate-pulse rounded bg-gray-100" />

                    <div className="h-4 w-full animate-pulse rounded bg-gray-100" />

                    <div className="h-4 w-5/6 animate-pulse rounded bg-gray-100" />

                    <div className="h-11 w-full animate-pulse rounded-xl bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-lg">
                !
              </div>

              <h2 className="mt-4 text-base font-bold text-gray-900">
                Something went wrong
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                {error}
              </p>

              <button
                type="button"
                onClick={loadPosts}
                className="mt-5 rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Try again
              </button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
                ✦
              </div>

              <h2 className="mt-4 text-base font-bold text-gray-900">
                Nothing here yet
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                There aren&apos;t any posts matching this
                filter yet. Be the first person to start
                the conversation.
              </p>

              <button
                type="button"
                onClick={() => setShowCreatePost(true)}
                className="mt-5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-gray-950 hover:bg-gray-950 hover:text-white"
              >
                Create a Buzz
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onAction={handlePostAction}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Create post modal */}
      {showCreatePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
              <div>
                <h2 className="text-base font-bold text-gray-950">
                  Create a Buzz
                </h2>

                <p className="mt-0.5 text-xs text-gray-400">
                  Start a conversation on campus.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreatePost(false)
                }
                aria-label="Close create post"
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
              >
                ×
              </button>
            </div>

            <div className="p-5 sm:p-6">
              <CreatePostForm
                onPostCreated={handlePostCreated}
                onClose={() => setShowCreatePost(false)}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}