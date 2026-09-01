"use client";

import { useEffect, useState } from "react";
import EventCard from "@/components/events/EventCard";
import EventForm from "@/components/events/EventForm";
import { mockEvents } from "@/data/mockData";
import { Event } from "@/types";
import { getEvents } from "@/lib/api";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>(mockEvents);
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

  function handleEventCreated(newEvent: Event) {
    setEvents((current) => [newEvent, ...current]);
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campus Events</h1>
          <p className="mt-1 text-sm text-gray-500">
            Discover workshops, hackathons, cultural nights, and club activities.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 shadow-sm cursor-pointer"
        >
          + Create Event
        </button>
      </div>

      {isLoading && (
        <div className="mb-4 text-sm text-gray-500">Refreshing events from server...</div>
      )}

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <h2 className="text-lg font-semibold text-gray-900">No events scheduled</h2>
          <p className="mt-2 text-sm text-gray-500">Be the first to schedule an upcoming event!</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-5 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 cursor-pointer"
          >
            Create Event
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onViewDetails={(ev) => setSelectedEvent(ev)}
            />
          ))}
        </div>
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
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedEvent.name}
              </h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-xl text-gray-500 hover:text-black cursor-pointer"
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
                <p className="font-semibold text-gray-900 mb-1">About the Event:</p>
                <p className="leading-relaxed text-gray-600 bg-gray-50 p-4 rounded-xl border">
                  {selectedEvent.description}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
