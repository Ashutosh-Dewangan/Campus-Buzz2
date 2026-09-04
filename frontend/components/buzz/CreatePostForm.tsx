"use client";

import {
  ChangeEvent,
  FormEvent,
  useMemo,
  useState,
} from "react";

import { createPost } from "@/lib/api";
import { Post } from "@/types";

interface CreatePostFormProps {
  onPostCreated: (post: Post) => void;
  onClose: () => void;
}

const hashtagOptions = [
  {
    value: "#foodsplit",
    label: "#foodsplit",
    description: "Find people to share a food order",
  },
  {
    value: "#cabsplit",
    label: "#cabsplit",
    description: "Coordinate a shared ride",
  },
  {
    value: "#resell",
    label: "#resell",
    description: "Buy or sell something on campus",
  },
  {
    value: "#lost",
    label: "#lost",
    description: "Report something missing",
  },
  {
    value: "#found",
    label: "#found",
    description: "Report something you've found",
  },
];

const expiryOptions = [
  { value: "10m", label: "10 minutes" },
  { value: "30m", label: "30 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "6h", label: "6 hours" },
  { value: "12h", label: "12 hours" },
  { value: "24h", label: "24 hours" },
  { value: "2d", label: "2 days" },
];

export default function CreatePostForm({
  onPostCreated,
  onClose,
}: CreatePostFormProps) {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] =
    useState<string>("");

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [hashtag, setHashtag] =
    useState("#foodsplit");

  const [expiry, setExpiry] =
    useState("24h");

  const [contactName, setContactName] =
    useState("");

  const [contactPhone, setContactPhone] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const selectedHashtag = useMemo(
    () =>
      hashtagOptions.find(
        (option) => option.value === hashtag
      ),
    [hashtag]
  );

  const needsContact =
    hashtag === "#lost" ||
    hashtag === "#found";

  const needsExpiry =
    hashtag === "#foodsplit" ||
    hashtag === "#cabsplit";

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    setError("");
    setImage(file);

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview("");

    const fileInput =
      document.getElementById(
        "buzz-image"
      ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = "";
    }
  };

  const isValid = useMemo(() => {
    if (!image) return false;
    if (!title.trim()) return false;
    if (!description.trim()) return false;

    if (needsContact) {
      if (!contactName.trim()) return false;
      if (!contactPhone.trim()) return false;
    }

    return true;
  }, [
    image,
    title,
    description,
    needsContact,
    contactName,
    contactPhone,
  ]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!isValid || !image) {
      setError(
        "Please complete all required fields before posting."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const formData = new FormData();

      formData.append("image", image);
      formData.append("title", title.trim());
      formData.append(
        "description",
        description.trim()
      );
      formData.append("hashtags", hashtag);

      if (needsContact) {
        formData.append(
          "contactName",
          contactName.trim()
        );

        formData.append(
          "contactPhone",
          contactPhone.trim()
        );
      }

      if (needsExpiry) {
        formData.append("expiry", expiry);
      }

      const newPost = await createPost(formData);

      onPostCreated(newPost);
      onClose();

      setImage(null);
      setImagePreview("");
      setTitle("");
      setDescription("");
      setHashtag("#foodsplit");
      setExpiry("24h");
      setContactName("");
      setContactPhone("");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create your post."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Intro */}
      <div className="comic-form-note">
        <div className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center text-sm" style={{ border: "3px solid #000", background: "var(--accent)" }}>
            ✦
          </div>

          <div>
            <p className="text-sm font-semibold">
              Start a campus conversation
            </p>

            <p className="mt-1 text-xs leading-5" style={{ color: "var(--fg-muted)" }}>
              Choose a hashtag carefully — it determines
              what happens when other students interact
              with your post.
            </p>
          </div>
        </div>
      </div>

      {/* Image */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="buzz-image"
            className="text-sm font-semibold"
          >
            Image
            <span className="ml-1 text-orange-500">
              *
            </span>
          </label>

          <span className="text-[11px] text-gray-400">
            Max 5MB
          </span>
        </div>

        {imagePreview ? (
          <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            <img
              src={imagePreview}
              alt="Selected post preview"
              className="max-h-64 w-full object-cover"
            />

            <button
              type="button"
              onClick={removeImage}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/75 text-sm text-white backdrop-blur transition hover:bg-black"
              aria-label="Remove selected image"
            >
              ×
            </button>
          </div>
        ) : (
          <label
            htmlFor="buzz-image"
            className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center transition hover:border-gray-400 hover:bg-gray-100"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg shadow-sm">
              ↑
            </span>

            <span className="mt-3 text-sm font-semibold text-gray-700">
              Upload an image
            </span>

            <span className="mt-1 text-xs text-gray-400">
              JPG, PNG, WEBP up to 5MB
            </span>
          </label>
        )}

        <input
          id="buzz-image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="sr-only"
        />
      </div>

      {/* Title */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="buzz-title"
            className="text-sm font-semibold"
          >
            Title
            <span className="ml-1 text-orange-500">
              *
            </span>
          </label>

          <span className="text-[11px] text-gray-400">
            {title.length}/100
          </span>
        </div>

        <input
          id="buzz-title"
          type="text"
          value={title}
          maxLength={100}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          placeholder="What do you want campus to know?"
          className="comic-input w-full px-4 py-3 text-sm outline-none"
        />
      </div>

      {/* Description */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="buzz-description"
            className="text-sm font-semibold"
          >
            Description
            <span className="ml-1 text-orange-500">
              *
            </span>
          </label>

          <span className="text-[11px] text-gray-400">
            {description.length}/1000
          </span>
        </div>

        <textarea
          id="buzz-description"
          value={description}
          maxLength={1000}
          rows={5}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          placeholder="Add the details students need..."
          className="comic-input w-full resize-none px-4 py-3 text-sm leading-6 outline-none"
        />
      </div>

      {/* Hashtag */}
      <div>
        <label
          htmlFor="buzz-hashtag"
          className="mb-2 block text-sm font-semibold"
        >
          Hashtag
          <span className="ml-1 text-orange-500">
            *
          </span>
        </label>

        <select
          id="buzz-hashtag"
          value={hashtag}
          onChange={(event) =>
            setHashtag(event.target.value)
          }
          className="comic-input w-full px-4 py-3 text-sm outline-none"
        >
          {hashtagOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        {selectedHashtag && (
          <div className="mt-2 rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-[11px] leading-5 text-gray-500">
              {selectedHashtag.description}
            </p>
          </div>
        )}
      </div>

      {/* Expiry */}
      {needsExpiry && (
        <div>
          <label
            htmlFor="buzz-expiry"
            className="mb-2 block text-sm font-semibold"
          >
            Coordination expiry
            <span className="ml-1 text-orange-500">
              *
            </span>
          </label>

          <select
            id="buzz-expiry"
            value={expiry}
            onChange={(event) =>
              setExpiry(event.target.value)
            }
            className="comic-input w-full px-4 py-3 text-sm outline-none"
          >
            {expiryOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>

          <p className="mt-2 text-[11px] leading-5 text-gray-400">
            The post will automatically expire after
            this duration.
          </p>
        </div>
      )}

      {/* Contact */}
      {needsContact && (
        <div className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
          <div>
            <p className="text-sm font-semibold">
              Contact information
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              This information will be shown to students
              who tap your lost/found post.
            </p>
          </div>

          <div>
            <label
              htmlFor="buzz-contact-name"
              className="mb-2 block text-xs font-semibold text-gray-700"
            >
              Contact name
            </label>

            <input
              id="buzz-contact-name"
              type="text"
              value={contactName}
              onChange={(event) =>
                setContactName(event.target.value)
              }
              placeholder="Your name"
              className="comic-input w-full px-4 py-3 text-sm outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="buzz-contact-phone"
              className="mb-2 block text-xs font-semibold text-gray-700"
            >
              Contact phone
            </label>

            <input
              id="buzz-contact-phone"
              type="tel"
              value={contactPhone}
              onChange={(event) =>
                setContactPhone(event.target.value)
              }
              placeholder="Your phone number"
              className="comic-input w-full px-4 py-3 text-sm outline-none"
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="comic-btn-outline disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="comic-btn disabled:opacity-50"
        >
          {isSubmitting
            ? "Posting..."
            : "Publish Buzz"}
        </button>
      </div>
    </form>
  );
}