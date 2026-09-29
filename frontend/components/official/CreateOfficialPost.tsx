"use client";

import { useState } from "react";
import { OfficialPost } from "@/types";
import { createOfficialPost } from "@/lib/api";

interface CreateOfficialPostProps {
  onClose: () => void;
  onPostCreated?: (newPost: OfficialPost) => void;
}

const commonOrgs = [
  "Placement Cell",
  "Student Council",
  "Dean of Student Affairs",
  "Cultural Society",
  "Coding Club",
  "Sports Committee",
  "Academic Office",
];

export default function CreateOfficialPost({
  onClose,
  onPostCreated,
}: CreateOfficialPostProps) {
  const [organization, setOrganization] = useState("");
  const [content, setContent] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [eventName, setEventName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!organization.trim()) {
      setError("Please select or enter the publishing organization.");
      return;
    }

    if (!content.trim()) {
      setError("Please enter the announcement content.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createOfficialPost({
        organization: organization.trim(),
        content: content.trim(),
        formUrl: formUrl.trim() || undefined,
        eventName: eventName.trim() || undefined,
      });

      onPostCreated?.(created);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create official post");
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
              Create Official Notice
            </h2>
            <p className="mt-1 text-xs" style={{ color: "var(--neon-cyan)" }}>
              Authorized Student Bodies &amp; Campus Announcements
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer border-2 border-black bg-[#16192b] px-2.5 py-1 text-sm font-bold text-white transition hover:bg-[#252a48]"
            style={{ boxShadow: "2px 2px 0 #000" }}
          >
            ✕
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
              htmlFor="official-org"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider"
              style={{ color: "var(--neon-yellow)" }}
            >
              Publishing Body / Organization *
            </label>
            <input
              id="official-org"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              list="org-list"
              placeholder="e.g. Placement Cell, Student Council, Coding Club"
              className="comic-input font-readable w-full px-4 py-2 text-sm"
              required
            />
            <datalist id="org-list">
              {commonOrgs.map((org) => (
                <option key={org} value={org} />
              ))}
            </datalist>
          </div>

          <div>
            <label
              htmlFor="official-content"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider"
              style={{ color: "var(--neon-yellow)" }}
            >
              Notice Content *
            </label>
            <textarea
              id="official-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Important notice details, instructions, deadlines..."
              className="comic-input font-readable w-full px-4 py-2 text-sm leading-relaxed"
              required
            />
          </div>

          <div>
            <label
              htmlFor="official-form-url"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider"
              style={{ color: "var(--neon-yellow)" }}
            >
              Form / Registration URL (Optional)
            </label>
            <input
              id="official-form-url"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              type="url"
              placeholder="https://forms.google.com/..."
              className="comic-input w-full px-4 py-2 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="official-event-name"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider"
              style={{ color: "var(--neon-yellow)" }}
            >
              Linked Event Name (Optional)
            </label>
            <input
              id="official-event-name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. Placement Drive 2026, Annual Elections"
              className="comic-input w-full px-4 py-2 text-sm"
            />
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
              {isSubmitting ? "Publishing..." : "Publish Notice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
