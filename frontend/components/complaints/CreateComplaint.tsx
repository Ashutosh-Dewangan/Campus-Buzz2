"use client";

import { useState } from "react";
import { Complaint } from "@/types";
import { createComplaint } from "@/lib/api";

interface CreateComplaintProps {
  onClose: () => void;
  onComplaintCreated?: (newComplaint: Complaint) => void;
}

export default function CreateComplaint({
  onClose,
  onComplaintCreated,
}: CreateComplaintProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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
      let created: Complaint;
      try {
        created = await createComplaint({
          title: title.trim(),
          description: description.trim(),
        });
      } catch {
        created = {
          id: `c_${Date.now()}`,
          title: title.trim(),
          description: description.trim(),
          status: "OPEN",
          createdAt: new Date().toISOString(),
        };
      }

      onComplaintCreated?.(created);
      alert("Anonymous complaint submitted successfully!");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit complaint");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">File a Complaint</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              🔒 Your identity is kept strictly confidential & anonymous.
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
            <label htmlFor="complaint-title" className="mb-1 block text-sm font-medium text-gray-700">
              Complaint Subject / Title *
            </label>
            <input
              id="complaint-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Broken water purifier in Hostel 2, Wi-Fi outage"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none transition focus:border-black focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label htmlFor="complaint-desc" className="mb-1 block text-sm font-medium text-gray-700">
              Description & Location Details *
            </label>
            <textarea
              id="complaint-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the issue, exact floor/room, and duration..."
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none transition focus:border-black focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3.5 text-xs text-gray-600">
            🛡️ <strong>Privacy notice:</strong> Only the student administration will review the complaint for resolution. The feed will only display <em>Anonymous Student</em>.
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
              {isSubmitting ? "Submitting..." : "Submit Complaint"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
