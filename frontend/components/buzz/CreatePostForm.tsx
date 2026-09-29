"use client";

import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useMemo,
  useRef,
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
    category: "Food Split",
    description: "Find peers to share a food order & split bills (opens live room)",
    accentColor: "#ff3b4a",
  },
  {
    value: "#cabsplit",
    label: "#cabsplit",
    category: "Cab Split",
    description: "Coordinate a shared cab to airport, station, or city (opens live room)",
    accentColor: "#2af0ff",
  },
  {
    value: "#resell",
    label: "#resell",
    category: "Resell",
    description: "Buy/sell books, electronics, cycles & gear (opens buyer/seller room)",
    accentColor: "#b44fff",
  },
  {
    value: "#lost",
    label: "#lost",
    category: "Lost Item",
    description: "Report something missing on campus with verified contact info",
    accentColor: "#ffe14a",
  },
  {
    value: "#found",
    label: "#found",
    category: "Found Item",
    description: "Report something you found to return to a campus peer",
    accentColor: "#00e5c8",
  },
];

const expiryOptions = [
  { value: "10m", label: "10 minutes" },
  { value: "30m", label: "30 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "6h", label: "6 hours" },
  { value: "12h", label: "12 hours" },
  { value: "24h", label: "24 hours (default)" },
  { value: "2d", label: "2 days" },
];

export default function CreatePostForm({
  onPostCreated,
  onClose,
}: CreatePostFormProps) {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hashtag, setHashtag] = useState("#foodsplit");
  const [expiry, setExpiry] = useState("24h");

  // Specific to #lost and #found
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Specific to #resell
  const [price, setPrice] = useState("");
  const [itemCondition, setItemCondition] = useState("Like New");

  // Specific to #cabsplit
  const [departureTime, setDepartureTime] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedHashtag = useMemo(
    () =>
      hashtagOptions.find((option) => option.value === hashtag) ||
      hashtagOptions[0],
    [hashtag]
  );

  const needsContact = hashtag === "#lost" || hashtag === "#found";
  const needsExpiry = hashtag === "#foodsplit" || hashtag === "#cabsplit";
  const isResell = hashtag === "#resell";
  const isCabSplit = hashtag === "#cabsplit";

  const processFile = (file: File) => {
    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      setError("Only PNG and JPEG images are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    setError("");
    setImage(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formattedFileSize = useMemo(() => {
    if (!image) return "";
    const sizeInKb = image.size / 1024;
    if (sizeInKb >= 1024) {
      return `${(sizeInKb / 1024).toFixed(1)} MB`;
    }
    return `${Math.round(sizeInKb)} KB`;
  }, [image]);

  const isValid = useMemo(() => {
    if (!image) return false;
    if (!title.trim()) return false;
    if (!description.trim()) return false;

    if (needsContact) {
      if (!contactName.trim()) return false;
      if (!contactPhone.trim()) return false;
    }

    return true;
  }, [image, title, description, needsContact, contactName, contactPhone]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValid || !image) {
      setError("Please complete all required fields before posting.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const formData = new FormData();
      formData.append("image", image);
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("hashtags", JSON.stringify([hashtag]));

      if (needsContact) {
        formData.append("contactName", contactName.trim());
        formData.append("contactPhone", contactPhone.trim());
      }

      if (isResell) {
        if (price.trim()) formData.append("price", price.trim());
        if (itemCondition.trim()) formData.append("itemCondition", itemCondition.trim());
      }

      if (isCabSplit) {
        if (departureTime.trim()) formData.append("departureTime", departureTime.trim());
        if (pickupLocation.trim()) formData.append("pickupLocation", pickupLocation.trim());
      }

      if (needsExpiry) {
        const expiryMsMap: Record<string, number> = {
          "10m": 10 * 60 * 1000,
          "30m": 30 * 60 * 1000,
          "1h": 60 * 60 * 1000,
          "6h": 6 * 60 * 60 * 1000,
          "12h": 12 * 60 * 60 * 1000,
          "24h": 24 * 60 * 60 * 1000,
          "2d": 2 * 24 * 60 * 60 * 1000,
        };
        const expiryMs = expiryMsMap[expiry] || 24 * 60 * 60 * 1000;
        const expiresAt = new Date(Date.now() + expiryMs).toISOString();
        formData.append("expiresAt", expiresAt);
      }

      const newPost = await createPost(formData);
      onPostCreated(newPost);
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to create your post."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      {/* ---------------- SECTION 1: POST DETAILS ---------------- */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-2 border-b border-black/40 pb-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-[var(--accent)] text-[10px] font-black text-white shadow-[1px_1px_0_#000]">
            1
          </span>
          <span className="text-[11px] font-black tracking-wider text-[var(--fg-muted)] uppercase">
            Post Details
          </span>
        </div>

        {/* Image Upload Area */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-bold text-[var(--fg)]">
              Photo <span className="text-[var(--accent)]">*</span>
            </span>
            <span className="text-[10px] text-[var(--fg-muted)]">
              PNG or JPG, max 5MB (Mandatory for Campus Buzz)
            </span>
          </div>

          {imagePreview ? (
            <div className="relative overflow-hidden rounded-sm border-2 border-black bg-[var(--bg-terminal)] shadow-[3px_3px_0_#000]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Selected post preview"
                className="max-h-48 w-full object-cover"
              />
              <div className="flex items-center justify-between border-t border-black bg-[rgba(8,6,20,0.92)] px-3 py-2 text-xs">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-semibold text-[var(--fg)]">
                    {image?.name || "Selected image"}
                  </span>
                  {formattedFileSize && (
                    <span className="shrink-0 rounded-sm bg-black/60 px-1.5 py-0.5 text-[10px] text-[var(--neon-cyan)]">
                      {formattedFileSize}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer text-[11px] font-bold text-[var(--neon-cyan)] hover:underline"
                  >
                    Replace
                  </button>
                  <span className="text-white/30">|</span>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="cursor-pointer text-[11px] font-bold text-[var(--accent)] hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex min-h-[110px] cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed p-4 text-center transition-all ${
                isDragging
                  ? "border-[var(--neon-cyan)] bg-[rgba(42,240,255,0.08)] shadow-[0_0_12px_rgba(42,240,255,0.25)]"
                  : "border-black/60 bg-[rgba(10,6,24,0.6)] shadow-[2px_2px_0_#000] hover:border-[var(--neon-cyan)] hover:bg-[rgba(10,6,24,0.85)]"
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-[var(--accent)] text-white shadow-[2px_2px_0_#000]">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="mt-2 text-xs font-bold text-[var(--fg)]">
                {isDragging ? "Drop image here" : "Click to select or drag photo here"}
              </p>
              <p className="mt-0.5 text-[10px] text-[var(--fg-muted)]">
                Required for student feed transparency
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            id="buzz-image"
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleImageChange}
            className="sr-only"
          />
        </div>

        {/* Title */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <label htmlFor="buzz-title" className="font-bold text-[var(--fg)]">
              Title <span className="text-[var(--accent)]">*</span>
            </label>
            <span
              className={`text-[10px] ${
                title.length > 90 ? "text-[var(--accent)] font-bold" : "text-[var(--fg-muted)]"
              }`}
            >
              {title.length}/100
            </span>
          </div>
          <input
            id="buzz-title"
            type="text"
            value={title}
            maxLength={100}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Domino's 2-pizza split / Airport cab share 5:30 AM / TI-84 Calculator"
            className="comic-input w-full px-3 py-2 text-xs text-[var(--fg)] outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <label htmlFor="buzz-description" className="font-bold text-[var(--fg)]">
              Description <span className="text-[var(--accent)]">*</span>
            </label>
            <span
              className={`text-[10px] ${
                description.length > 950 ? "text-[var(--accent)] font-bold" : "text-[var(--fg-muted)]"
              }`}
            >
              {description.length}/1000
            </span>
          </div>
          <textarea
            id="buzz-description"
            value={description}
            maxLength={1000}
            rows={3}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add relevant specifics: pickup spot, luggage space, split ratio, item details..."
            className="comic-input font-readable w-full resize-none px-3 py-2 text-xs leading-relaxed text-[var(--fg)] outline-none"
          />
        </div>
      </div>

      {/* ---------------- SECTION 2: INTENT & HASHTAG ---------------- */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-black/40 pb-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-[var(--neon-cyan)] text-[10px] font-black text-black shadow-[1px_1px_0_#000]">
            2
          </span>
          <span className="text-[11px] font-black tracking-wider text-[var(--fg-muted)] uppercase">
            Hashtag-Driven Coordination
          </span>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-[var(--fg)]">
            Select Hashtag <span className="text-[var(--accent)]">*</span>
          </label>

          {/* Interactive Hashtag Tiles */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {hashtagOptions.map((opt) => {
              const isSelected = hashtag === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setHashtag(opt.value)}
                  style={{
                    borderColor: isSelected ? opt.accentColor : "black",
                    boxShadow: isSelected
                      ? `2px 2px 0 #000, 0 0 10px ${opt.accentColor}44`
                      : "2px 2px 0 #000",
                  }}
                  className={`relative flex flex-col items-start rounded-sm border-2 p-2 text-left transition-all ${
                    isSelected
                      ? "bg-[rgba(18,12,36,0.95)]"
                      : "bg-[rgba(10,6,24,0.65)] hover:border-white/40"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span
                      style={{ color: opt.accentColor }}
                      className="text-[10px] font-black tracking-wider uppercase"
                    >
                      {opt.value}
                    </span>
                    <span className="rounded-xs border border-black/40 bg-black/60 px-1 py-0.2 text-[8px] font-black uppercase tracking-wider" style={{ color: opt.accentColor }}>
                      {opt.category}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-[10px] text-[var(--fg-muted)]">
                    {opt.category}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Helper Note for Selected Hashtag */}
          <div className="mt-2.5 flex items-start gap-2 rounded-sm border border-black/60 bg-[rgba(14,10,32,0.85)] p-2.5 text-left shadow-[2px_2px_0_#000]">
            <span
              style={{ color: selectedHashtag.accentColor }}
              className="mt-0.5 text-xs font-black"
            >
              ✦
            </span>
            <div className="text-[11px] leading-tight">
              <p className="font-bold text-[var(--fg)]">
                {selectedHashtag.value === "#resell"
                  ? "Resell opens a live buyer/seller negotiation room."
                  : selectedHashtag.value === "#foodsplit"
                  ? "Food Split opens a live group coordination room."
                  : selectedHashtag.value === "#cabsplit"
                  ? "Cab Split opens a shared ride coordination room."
                  : "Lost & Found opens a direct verified contact surface (no public group chat)."}
              </p>
              <p className="mt-0.5 text-[var(--fg-muted)]">
                {selectedHashtag.description}.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- SECTION 3: HASHTAG-SPECIFIC CONFIGURATION ---------------- */}
      {(needsExpiry || needsContact || isResell) && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-black/40 pb-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-[var(--neon-yellow)] text-[10px] font-black text-black shadow-[1px_1px_0_#000]">
              3
            </span>
            <span className="text-[11px] font-black tracking-wider text-[var(--fg-muted)] uppercase">
              {needsExpiry
                ? "Expiry & Schedule"
                : isResell
                ? "Item & Price Information"
                : "Verified Contact Details"}
            </span>
          </div>

          {/* Expiry Selector (Food & Cab Split) */}
          {needsExpiry && (
            <div className="space-y-3 rounded-sm border-2 border-black bg-[rgba(14,10,32,0.85)] p-3 shadow-[2px_2px_0_#000]">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <label htmlFor="buzz-expiry" className="font-bold text-[var(--fg)]">
                    Coordination Expiry <span className="text-[var(--accent)]">*</span>
                  </label>
                  <span className="text-[10px] text-[var(--neon-yellow)] font-semibold">
                    Auto-expires when window ends
                  </span>
                </div>

                <select
                  id="buzz-expiry"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="comic-input w-full px-3 py-2 text-xs text-[var(--fg)] outline-none"
                >
                  {expiryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cab Split specific departure & pickup */}
              {isCabSplit && (
                <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="buzz-cab-dep"
                      className="mb-1 block text-[11px] font-bold text-[var(--fg)]"
                    >
                      Departure Time
                    </label>
                    <input
                      id="buzz-cab-dep"
                      type="text"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      placeholder="e.g. Tomorrow 5:30 AM"
                      className="comic-input w-full px-3 py-1.5 text-xs text-[var(--fg)] outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="buzz-cab-pickup"
                      className="mb-1 block text-[11px] font-bold text-[var(--fg)]"
                    >
                      Pickup Spot
                    </label>
                    <input
                      id="buzz-cab-pickup"
                      type="text"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="e.g. Main Gate Security Post"
                      className="comic-input w-full px-3 py-1.5 text-xs text-[var(--fg)] outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Resell Specific Fields (Price & Condition) */}
          {isResell && (
            <div className="space-y-2.5 rounded-sm border-2 border-black bg-[rgba(14,10,32,0.85)] p-3 shadow-[2px_2px_0_#000]">
              <div>
                <p className="text-xs font-bold text-[var(--tag-resell)]">
                  Resell Item Details
                </p>
                <p className="mt-0.5 text-[10px] text-[var(--fg-muted)]">
                  Price is negotiated directly with interested campus peers in the live room.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="buzz-resell-price"
                    className="mb-1 block text-[11px] font-bold text-[var(--fg)]"
                  >
                    Asking Price (Optional)
                  </label>
                  <input
                    id="buzz-resell-price"
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. ₹2,500 or Negotiable"
                    className="comic-input w-full px-3 py-2 text-xs text-[var(--fg)] outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="buzz-resell-condition"
                    className="mb-1 block text-[11px] font-bold text-[var(--fg)]"
                  >
                    Item Condition
                  </label>
                  <select
                    id="buzz-resell-condition"
                    value={itemCondition}
                    onChange={(e) => setItemCondition(e.target.value)}
                    className="comic-input w-full px-3 py-2 text-xs text-[var(--fg)] outline-none"
                  >
                    <option value="Brand New">Brand New / Sealed</option>
                    <option value="Like New">Like New (Mint Condition)</option>
                    <option value="Good">Good (Working & Maintained)</option>
                    <option value="Fair">Fair (Noticeable Wear)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Contact Details (Lost & Found ONLY) */}
          {needsContact && (
            <div className="space-y-2.5 rounded-sm border-2 border-black bg-[rgba(14,10,32,0.85)] p-3 shadow-[2px_2px_0_#000]">
              <div>
                <p className="text-xs font-bold text-[var(--neon-cyan)]">
                  Verified Contact Details
                </p>
                <p className="mt-0.5 text-[10px] text-[var(--fg-muted)]">
                  Only shown when students open the contact modal for this lost or found report.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="buzz-contact-name"
                    className="mb-1 block text-[11px] font-bold text-[var(--fg)]"
                  >
                    Contact Name / Hostel Room <span className="text-[var(--accent)]">*</span>
                  </label>
                  <input
                    id="buzz-contact-name"
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Sneha Patel / GH-2 Room 214"
                    className="comic-input w-full px-3 py-2 text-xs text-[var(--fg)] outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="buzz-contact-phone"
                    className="mb-1 block text-[11px] font-bold text-[var(--fg)]"
                  >
                    Contact Phone / WhatsApp <span className="text-[var(--accent)]">*</span>
                  </label>
                  <input
                    id="buzz-contact-phone"
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="comic-input w-full px-3 py-2 text-xs text-[var(--fg)] outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-sm border-2 border-black bg-[rgba(255,45,74,0.18)] p-2.5 text-xs font-bold text-[var(--accent)] shadow-[2px_2px_0_#000]"
        >
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2.5 border-t border-black/40 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="retro-btn-outline cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="retro-btn cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Publishing...
            </span>
          ) : (
            "Publish Buzz ↗"
          )}
        </button>
      </div>
    </form>
  );
}