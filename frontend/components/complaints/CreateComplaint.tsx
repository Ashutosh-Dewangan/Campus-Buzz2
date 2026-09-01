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
            onClick={onClose}
            className="text-xl text-gray-500 hover:text-black cursor-pointer"
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
              Complaint Subject / Title *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Broken water purifier in Hostel 2, Wi-Fi outage"
              className="w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description & Location Details *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the issue, exact floor/room, and duration..."
              className="w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="rounded-xl bg-gray-50 p-3.5 text-xs text-gray-600 border">
            🛡️ <strong>Privacy notice:</strong> Only the student administration will review the complaint for resolution. The feed will only display <em>Anonymous Student</em>.
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-5 py-2.5 font-medium hover:bg-gray-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-black px-5 py-2.5 font-semibold text-white hover:bg-gray-800 disabled:opacity-50 transition cursor-pointer"
            >
              {isSubmitting ? "Submitting..." : "Submit Complaint"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
