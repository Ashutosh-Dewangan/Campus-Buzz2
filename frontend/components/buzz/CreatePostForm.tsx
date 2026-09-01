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

    if (
      (hashtag === "#foodsplit" || hashtag === "#cabsplit") &&
      (!expiry ||
        Number(expiry) < 10 / 60 ||
        Number(expiry) > 48)
    ) {
      setError("Expiry must be between 10 minutes and 2 days.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Build FormData for backend API
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("hashtag", hashtag);
      formData.append("author", "You");
      if (hashtag === "#foodsplit" || hashtag === "#cabsplit") {
        formData.append("expiry", expiry);
      }
      if (contact.trim()) {
        formData.append("contact", contact.trim());
      }
      if (file) {
        formData.append("image", file);
      }

      let created: Post;
      try {
        created = await createPost(formData);
      } catch (err: any) {
        // Fallback for offline / demo mode
        const imageMap: Record<string, string> = {
          "#foodsplit": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
          "#cabsplit": "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d",
          "#resell": "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
          "#lost": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
          "#found": "https://images.unsplash.com/photo-1577702312708-7c1c4a3b6f4e",
        };

        const hours = (hashtag === "#foodsplit" || hashtag === "#cabsplit") ? Number(expiry) : undefined;
        created = {
          id: Date.now().toString(),
          title: title.trim(),
          description: description.trim(),
          hashtag,
          image: file ? URL.createObjectURL(file) : (imageMap[hashtag] || "https://images.unsplash.com/photo-1523240795612-9a054b0db644"),
          author: "You",
          contact: contact.trim() || undefined,
          createdAt: new Date().toISOString(),
          expiresAt: hours ? new Date(Date.now() + hours * 60 * 60 * 1000).toISOString() : undefined,
        };
      }

      onPostCreated?.(created);
      alert("Post created successfully!");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  }

  const needsExpiry =
    hashtag === "#foodsplit" || hashtag === "#cabsplit";
  const needsContact =
    hashtag === "#lost" || hashtag === "#found";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Create Buzz
          </h2>

          <button
            onClick={onClose}
            className="text-xl text-gray-500 hover:text-black"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }}
              className="w-full rounded-lg border p-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Title
            </label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's happening?"
              className="w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
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

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Hashtag
            </label>

            <select
              value={hashtag}
              onChange={(e) =>
                setHashtag(e.target.value as Hashtag)
              }
              className="w-full rounded-lg border px-4 py-2.5 bg-white outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Select hashtag</option>

              {hashtags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {needsContact && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Contact Info (Phone / Email)
              </label>

              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="e.g. 9876543210 or your@email.com"
                className="w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          )}

          {needsExpiry && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Expiry
              </label>

              <select
                value={expiry}
                onChange={(e) =>
                  setExpiry(e.target.value)
                }
                className="w-full rounded-lg border px-4 py-2.5 bg-white outline-none focus:ring-2 focus:ring-black"
              >
                <option value="0.1667">
                  10 minutes
                </option>
                <option value="0.5">
                  30 minutes
                </option>
                <option value="1">1 hour</option>
                <option value="6">6 hours</option>
                <option value="12">12 hours</option>
                <option value="24">24 hours</option>
                <option value="48">2 days</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-5 py-2.5 font-medium hover:bg-gray-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-black px-5 py-2.5 font-semibold text-white hover:bg-gray-800 disabled:opacity-50 transition"
            >
              {isSubmitting ? "Creating..." : "Create Buzz"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}