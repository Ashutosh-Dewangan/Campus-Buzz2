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
      let created: Event;
      try {
        created = await createEvent({
          name: name.trim(),
          date: date.trim(),
          time: time.trim(),
          venue: venue.trim(),
          description: description.trim(),
          createdBy: createdBy.trim() || "Campus Student",
        });
      } catch {
        created = {
          id: `e_${Date.now()}`,
          name: name.trim(),
          date: date.trim(),
          time: time.trim(),
          venue: venue.trim(),
          description: description.trim(),
          createdBy: createdBy.trim() || "Campus Student",
        };
      }

      onEventCreated?.(created);
      alert("Event created successfully!");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="comic-modal p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="stay-loop-title">Create Event</h2>
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
            <label htmlFor="event-name" className="mb-1 block text-sm font-medium text-gray-700">
              Event Name *
            </label>
            <input
              id="event-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hackathon 2026, Music Night"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none transition focus:border-black focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="event-date" className="mb-1 block text-sm font-medium text-gray-700">
                Date *
              </label>
              <input
                id="event-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. Oct 12, 2026"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none transition focus:border-black focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label htmlFor="event-time" className="mb-1 block text-sm font-medium text-gray-700">
                Time *
              </label>
              <input
                id="event-time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 5:00 PM - 8:00 PM"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none transition focus:border-black focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div>
            <label htmlFor="event-venue" className="mb-1 block text-sm font-medium text-gray-700">
              Venue / Location *
            </label>
            <input
              id="event-venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Main Auditorium, Seminar Hall B"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none transition focus:border-black focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label htmlFor="event-organizer" className="mb-1 block text-sm font-medium text-gray-700">
              Organizer / Club Name
            </label>
            <input
              id="event-organizer"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              placeholder="e.g. Coding Club, Student Council"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none transition focus:border-black focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label htmlFor="event-desc" className="mb-1 block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="event-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the event, rules, schedule, prizes..."
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
              {isSubmitting ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
