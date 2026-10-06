"use client";

import { useState } from "react";
import { Complaint, ComplaintCategory } from "@/types";
import { createComplaint } from "@/lib/api";
import { XIcon } from "@/components/ui/Icons";

interface CreateComplaintProps {
  onClose: () => void;
  onComplaintCreated?: (newComplaint: Complaint) => void;
}

const categories: ComplaintCategory[] = [
  "Hostel",
  "Mess / Cafeteria",
  "Campus Wi-Fi",
  "Library / Facilities",
  "Academic",
  "Other",
];

export default function CreateComplaint({
  onClose,
  onComplaintCreated,
}: CreateComplaintProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ComplaintCategory>("Hostel");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please enter a title for the complaint.");
      return;
    }

    if (!description.trim()) {
      setError("Please provide details of the issue.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createComplaint({
        title: title.trim(),
        description: description.trim(),
        category,
      });

      onComplaintCreated?.(created);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit complaint");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="comic-modal w-full max-w-lg p-6">
        <div className="mb-6 flex items-center justify-between border-b pb-4" style={{ borderColor: "#000" }}>
          <div>
            <h2 className="stay-loop-title" style={{ fontSize: 24 }}>
              File a Complaint
            </h2>
            <p className="mt-1 text-xs" style={{ color: "var(--neon-cyan)" }}>
              Protected Anonymous Channel · Real Campus Triage
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer border-2 border-black bg-[#16192b] p-1.5 text-white transition hover:bg-[#252a48]"
            style={{ boxShadow: "2px 2px 0 #000" }}
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div
            className="mb-4 border-2 border-black p-3 text-sm font-bold"
            style={{
              background: "rgba(255,45,74,0.18)",
              color: "var(--accent)",
              boxShadow: "2px 2px 0 #000",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="complaint-cat"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider"
              style={{ color: "var(--neon-yellow)" }}
            >
              Category *
            </label>
            <select
              id="complaint-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
              className="comic-input w-full px-4 py-2.5 text-xs text-[var(--fg)] outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="complaint-title"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider"
              style={{ color: "var(--neon-yellow)" }}
            >
              Subject / Title *
            </label>
            <input
              id="complaint-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Broken water purifier in Hostel 2, Wi-Fi outage"
              className="comic-input font-readable w-full px-4 py-2.5 text-xs"
              required
            />
          </div>

          <div>
            <label
              htmlFor="complaint-desc"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider"
              style={{ color: "var(--neon-yellow)" }}
            >
              Description &amp; Location Details *
            </label>
            <textarea
              id="complaint-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the issue, exact wing/floor/room, and duration..."
              className="comic-input font-readable w-full px-4 py-2.5 text-xs leading-relaxed"
              required
            />
          </div>

          <div
            className="font-readable border-2 border-black p-3.5 text-xs leading-relaxed"
            style={{
              background: "rgba(42,240,255,0.08)",
              color: "var(--fg-muted)",
              boxShadow: "2px 2px 0 #000",
            }}
          >
            <strong style={{ color: "var(--neon-cyan)" }}>Privacy Notice:</strong> The public feed only displays <em style={{ color: "#fff" }}>Anonymous Student</em>. No student identity or roll number is publicly shown.
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="comic-btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="comic-btn disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Complaint"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
