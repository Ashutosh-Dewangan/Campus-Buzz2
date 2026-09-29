"use client";

import { useState } from "react";
import { Event } from "@/types";
import { createEvent } from "@/lib/api";

interface EventFormProps {
  onClose: () => void;
  onEventCreated?: (newEvent: Event) => void;
}

export default function EventForm({
  onClose,
  onEventCreated,
}: EventFormProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !date.trim() || !time.trim() || !venue.trim() || !description.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createEvent({
        name: name.trim(),
        date: date.trim(),
        time: time.trim(),
        venue: venue.trim(),
        description: description.trim(),
        createdBy: createdBy.trim() || "Campus Student",
      });

      onEventCreated?.(created);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create event");
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
              Create Campus Event
            </h2>
            <p className="mt-1 text-xs" style={{ color: "var(--neon-cyan)" }}>
              Official Activity &amp; Club Scheduling
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
              htmlFor="event-name"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider"
              style={{ color: "var(--neon-yellow)" }}
            >
              Event Name *
            </label>
            <input
              id="event-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hackathon 2026, Music Night"
              className="comic-input w-full px-4 py-2 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="event-date"
                className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider"
                style={{ color: "var(--neon-yellow)" }}
              >
                Date *
              </label>
              <input
                id="event-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="YYYY-MM-DD or Oct 12"
                className="comic-input w-full px-4 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label
                htmlFor="event-time"
                className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider"
                style={{ color: "var(--neon-yellow)" }}
              >
                Time *
              </label>
              <input
                id="event-time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 5:00 PM"
                className="comic-input w-full px-4 py-2 text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="event-venue"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider"
              style={{ color: "var(--neon-yellow)" }}
            >
              Venue / Location *
            </label>
            <input
              id="event-venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Main Auditorium, Seminar Hall B"
              className="comic-input w-full px-4 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="event-organizer"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider"
              style={{ color: "var(--neon-yellow)" }}
            >
              Organizer / Club Name
            </label>
            <input
              id="event-organizer"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              placeholder="e.g. Coding Club, Student Council"
              className="comic-input w-full px-4 py-2 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="event-desc"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider"
              style={{ color: "var(--neon-yellow)" }}
            >
              Description *
            </label>
            <textarea
              id="event-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the event, rules, schedule, prizes..."
              className="comic-input font-readable w-full px-4 py-2 text-sm leading-relaxed"
              required
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
              {isSubmitting ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
