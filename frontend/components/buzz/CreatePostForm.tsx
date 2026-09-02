"use client";

import { useState } from "react";
import { Hashtag, Post } from "@/types";
import { createPost } from "@/lib/api";

interface CreatePostFormProps {
  onClose: () => void;
  onPostCreated?: (newPost: Post) => void;
}

const hashtags: Hashtag[] = [
  "#foodsplit",
  "#cabsplit",
  "#resell",
  "#lost",
  "#found",
];

export default function CreatePostForm({
  onClose,
  onPostCreated,
}: CreatePostFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hashtag, setHashtag] = useState<Hashtag | "">("");
  const [expiry, setExpiry] = useState("24");
  const [contact, setContact] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError(null);

    // Image is mandatory for every Campus Buzz post
    if (!file) {
      setError("Please select an image.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a description.");
      return;
    }

    if (!hashtag) {
      setError("Please select a hashtag.");
      return;
    }

    // Expiry is mandatory only for foodsplit and cabsplit
    if (
      (hashtag === "#foodsplit" || hashtag === "#cabsplit") &&
      (!expiry ||
        Number(expiry) < 10 / 60 ||
        Number(expiry) > 48)
    ) {
      setError("Expiry must be between 10 minutes and 2 days.");
      return;
    }

    // Contact is required for lost/found posts
    if (
      (hashtag === "#lost" || hashtag === "#found") &&
      !contact.trim()
    ) {
      setError("Please provide contact information.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("hashtag", hashtag);
      formData.append("image", file);

      // Temporary until real authentication is connected
      formData.append("author", "You");

      if (
        hashtag === "#foodsplit" ||
        hashtag === "#cabsplit"
      ) {
        formData.append("expiry", expiry);
      }

      if (
        hashtag === "#lost" ||
        hashtag === "#found"
      ) {
        formData.append("contact", contact.trim());
      }

      const created = await createPost(formData);

      onPostCreated?.(created);

      alert("Post created successfully!");

      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create post.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const needsExpiry =
    hashtag === "#foodsplit" ||
    hashtag === "#cabsplit";

  const needsContact =
    hashtag === "#lost" ||
    hashtag === "#found";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Create Buzz
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-xl text-gray-500 hover:text-black"
          >
            ×
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* Image */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Image *
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
              }}
              className="w-full rounded-lg border p-2 text-sm"
            />

            <p className="mt-1 text-xs text-gray-500">
              An image is required for every Campus Buzz post.
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Title *
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="What's happening?"
              className="w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description *
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows={3}
              placeholder="Tell other students more..."
              className="w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Hashtag */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Hashtag *
            </label>

            <select
              value={hashtag}
              onChange={(e) =>
                setHashtag(
                  e.target.value as Hashtag
                )
              }
              className="w-full rounded-lg border bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">
                Select hashtag
              </option>

              {hashtags.map((tag) => (
                <option
                  key={tag}
                  value={tag}
                >
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {/* Contact */}
          {needsContact && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Contact Info *
              </label>

              <input
                value={contact}
                onChange={(e) =>
                  setContact(e.target.value)
                }
                placeholder="Phone or email"
                className="w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
              />

              <p className="mt-1 text-xs text-gray-500">
                This contact information will be shown to students
                viewing this post.
              </p>
            </div>
          )}

          {/* Expiry */}
          {needsExpiry && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Expiry *
              </label>

              <select
                value={expiry}
                onChange={(e) =>
                  setExpiry(e.target.value)
                }
                className="w-full rounded-lg border bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
              >
                <option value="0.1667">
                  10 minutes
                </option>

                <option value="0.5">
                  30 minutes
                </option>

                <option value="1">
                  1 hour
                </option>

                <option value="6">
                  6 hours
                </option>

                <option value="12">
                  12 hours
                </option>

                <option value="24">
                  24 hours
                </option>

                <option value="48">
                  2 days
                </option>
              </select>

              <p className="mt-1 text-xs text-gray-500">
                Food split and cab split posts automatically
                expire after this time.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border px-5 py-2.5 font-medium transition hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-black px-5 py-2.5 font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
            >
              {isSubmitting
                ? "Creating..."
                : "Create Buzz"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}