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
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Campus Events
              </h1>
              {rsvpedEvents.length > 0 && (
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200">
                  {rsvpedEvents.length} RSVP&apos;d
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Discover workshops, hackathons, cultural nights, and club activities.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="cursor-pointer rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
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
                className="h-64 animate-pulse rounded-2xl border bg-white shadow-sm"
              />
            ))}
          </div>
        )}

        {/* Events Grid */}
        {!isLoading && events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center sm:p-14">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
              📅
            </div>
            <h2 className="mt-5 text-lg font-semibold text-gray-900">
              No events scheduled
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Be the first to schedule an upcoming workshop or activity!
            </p>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="mt-5 cursor-pointer rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
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
            <div className="w-full max-w-lg rounded-2xl border bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900">
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

              <div className="my-5 space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">📅 Date:</span>
                  <span>{selectedEvent.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">🕐 Time:</span>
                  <span>{selectedEvent.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">📍 Venue:</span>
                  <span>{selectedEvent.venue}</span>
                </div>
                {selectedEvent.createdBy && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">🏛 Organizer:</span>
                    <span>{selectedEvent.createdBy}</span>
                  </div>
                )}
                <div className="pt-2">
                  <p className="mb-1 font-semibold text-gray-900">About the Event:</p>
                  <p className="rounded-xl border bg-gray-50 p-4 leading-relaxed text-gray-600">
                    {selectedEvent.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => toggleRsvp(selectedEvent.id)}
                  className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                    rsvpedEvents.includes(selectedEvent.id)
                      ? "bg-green-50 text-green-700 ring-1 ring-green-200 hover:bg-green-100"
                      : "bg-black text-white hover:bg-gray-800"
                  }`}
                >
                  {rsvpedEvents.includes(selectedEvent.id) ? "✓ Going" : "RSVP"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
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
