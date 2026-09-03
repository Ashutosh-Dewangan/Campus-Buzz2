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
      let created: OfficialPost;
      try {
        created = await createOfficialPost({
          organization: organization.trim(),
          content: content.trim(),
          formUrl: formUrl.trim() || undefined,
          eventName: eventName.trim() || undefined,
        });
      } catch {
        created = {
          id: `o_${Date.now()}`,
          organization: organization.trim(),
          content: content.trim(),
          formUrl: formUrl.trim() || undefined,
          eventName: eventName.trim() || undefined,
          createdAt: new Date().toISOString(),
        };
      }

      onPostCreated?.(created);
      alert("Official announcement posted successfully!");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create official post");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Create Official Notice
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Authorized student bodies & faculty announcements.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-xl text-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="official-org" className="mb-1 block text-sm font-medium text-gray-700">
              Publishing Body / Organization *
            </label>
            <input
              id="official-org"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              list="org-list"
              placeholder="Select or enter organization name"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none transition focus:border-black focus:ring-2 focus:ring-black"
            />
            <datalist id="org-list">
              {commonOrgs.map((org) => (
                <option key={org} value={org} />
              ))}
            </datalist>
          </div>

          <div>
            <label htmlFor="official-content" className="mb-1 block text-sm font-medium text-gray-700">
              Announcement / Notice Content *
            </label>
            <textarea
              id="official-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Important notice details, instructions, deadlines..."
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none transition focus:border-black focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label htmlFor="official-form-url" className="mb-1 block text-sm font-medium text-gray-700">
              Form / Registration URL (Optional)
            </label>
            <input
              id="official-form-url"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              type="url"
              placeholder="https://forms.google.com/..."
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none transition focus:border-black focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label htmlFor="official-event-name" className="mb-1 block text-sm font-medium text-gray-700">
              Linked Event Name (Optional)
            </label>
            <input
              id="official-event-name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. Placement Drive 2026, Annual Elections"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none transition focus:border-black focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-gray-200 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer rounded-xl bg-black px-5 py-2.5 font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? "Publishing..." : "Publish Notice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
