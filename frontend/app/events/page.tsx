"use client";

import { useEffect, useState } from "react";
import EventCard from "@/components/events/EventCard";
import EventForm from "@/components/events/EventForm";
import { mockEvents } from "@/data/mockData";
import { Event } from "@/types";
import { getEvents } from "@/lib/api";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [rsvpedEvents, setRsvpedEvents] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadEvents() {
      setIsLoading(true);
      try {
        const fetched = await getEvents();
        if (Array.isArray(fetched) && fetched.length > 0) {
          setEvents(fetched);
        }
      } catch (err) {
        console.warn("Backend API unavailable, using mock events fallback:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadEvents();
  }, []);

  function toggleRsvp(eventId: string) {
    setRsvpedEvents((current) =>
      current.includes(eventId)
        ? current.filter((id) => id !== eventId)
        : [...current, eventId]
    );
  }

  function handleEventCreated(newEvent: Event) {
    setEvents((current) => [newEvent, ...current]);
  }

  return (
    <main className="comic-page">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="comic-title">Campus Events</h1>
              {rsvpedEvents.length > 0 && (
                <span className="tag-pill tag-found tag-pill--active">
                  {rsvpedEvents.length} RSVP&apos;d
                </span>
              )}
            </div>
            <p className="comic-sub">
              Discover workshops, hackathons, cultural nights, and club activities.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="comic-btn"
          >
            + Create Event
          </button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="mb-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="comic-card h-64 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Events Grid */}
        {!isLoading && events.length === 0 ? (
          <div className="comic-card comic-empty">
            <div className="mx-auto flex h-14 w-14 items-center justify-center text-2xl" style={{ border: "3px solid #000" }}>
              📅
            </div>
            <h2 className="stay-loop-title mt-5">No events scheduled</h2>
            <p className="comic-sub mx-auto max-w-md">
              Be the first to schedule an upcoming workshop or activity!
            </p>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="comic-btn mt-5"
            >
              Create Event
            </button>
          </div>
        ) : (
          !isLoading && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isRsvped={rsvpedEvents.includes(event.id)}
                  onRsvp={() => toggleRsvp(event.id)}
                  onViewDetails={(ev) => setSelectedEvent(ev)}
                />
              ))}
            </div>
          )
        )}

        {/* Create Event Modal */}
        {showCreateModal && (
          <EventForm
            onClose={() => setShowCreateModal(false)}
            onEventCreated={handleEventCreated}
          />
        )}

        {/* View Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="comic-modal p-6">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "#000" }}>
                <h2 className="stay-loop-title">
                  {selectedEvent.name}
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="cursor-pointer rounded-lg p-1 text-xl text-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  ×
                </button>
              </div>

              <div className="my-5 space-y-3 text-sm" style={{ color: "var(--fg)" }}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">📅 Date:</span>
                  <span>{selectedEvent.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">🕐 Time:</span>
                  <span>{selectedEvent.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">📍 Venue:</span>
                  <span>{selectedEvent.venue}</span>
                </div>
                {selectedEvent.createdBy && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">🏛 Organizer:</span>
                    <span>{selectedEvent.createdBy}</span>
                  </div>
                )}
                <div className="pt-2">
                  <p className="mb-1 font-semibold">About the Event:</p>
                  <p className="comic-card p-4 leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                    {selectedEvent.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => toggleRsvp(selectedEvent.id)}
                  className="comic-btn"
                >
                  {rsvpedEvents.includes(selectedEvent.id) ? "✓ Going" : "RSVP"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="comic-btn-outline"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
