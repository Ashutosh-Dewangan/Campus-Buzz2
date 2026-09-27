"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import EventCard from "@/components/events/EventCard";
import EventForm from "@/components/events/EventForm";
import { Event } from "@/types";
import { getEvents } from "@/lib/api";
import { canCreateEvent } from "@/lib/auth";
import { useCurrentUser } from "@/lib/session";
import { parseEventDate } from "@/lib/date";

function getEventDate(event: Event): Date {
  return parseEventDate(event.date, event.time);
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [rsvpedEvents, setRsvpedEvents] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const user = useCurrentUser();
  const canCreate = user ? canCreateEvent(user.role) : false;

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const fetched = await getEvents();
      if (Array.isArray(fetched)) {
        setEvents(fetched);
      }
    } catch {
      setError("We couldn't load campus events right now.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function fetchInitial() {
      try {
        const fetched = await getEvents();
        if (!ignore && Array.isArray(fetched)) {
          setEvents(fetched);
        }
      } catch {
        if (!ignore) {
          setError("We couldn't load campus events right now.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchInitial();
    return () => {
      ignore = true;
    };
  }, []);

  const now = new Date();

  const upcomingEvents = useMemo(
    () =>
      events
        .filter((event) => getEventDate(event) >= now)
        .sort((a, b) => getEventDate(a).getTime() - getEventDate(b).getTime()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events]
  );

  const pastEvents = useMemo(
    () =>
      events
        .filter((event) => getEventDate(event) < now)
        .sort((a, b) => getEventDate(b).getTime() - getEventDate(a).getTime()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events]
  );

  function toggleRsvp(eventId: string) {
    setRsvpedEvents((current) =>
      current.includes(eventId)
        ? current.filter((id) => id !== eventId)
        : [...current, eventId]
    );
  }

  function handleEventCreated(newEvent: Event) {
    setEvents((current) => [newEvent, ...current]);
    setShowCreateModal(false);
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
              Workshops, hackathons, cultural nights and club activities.
            </p>
          </div>

          {canCreate && (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="comic-btn"
            >
              + Create Event
            </button>
          )}
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="mb-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="comic-card h-64 animate-pulse" />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="comic-card comic-empty mb-6">
            <p style={{ color: "var(--accent)", fontWeight: 800 }}>Failed to load events</p>
            <p className="comic-sub">{error}</p>
            <button
              type="button"
              onClick={loadEvents}
              className="comic-btn mt-4"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && events.length === 0 && (
          <div className="comic-card comic-empty">
            <div className="mx-auto flex h-14 w-14 items-center justify-center text-2xl" style={{ border: "3px solid #000" }}>
              📅
            </div>
            <h2 className="stay-loop-title mt-5">No events scheduled</h2>
            <p className="comic-sub mx-auto max-w-md">
              No upcoming workshops or activities yet.
            </p>
            {canCreate && (
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="comic-btn mt-5"
              >
                Create Event
              </button>
            )}
          </div>
        )}

        {/* Upcoming Events */}
        {!isLoading && upcomingEvents.length > 0 && (
          <section className="mb-10">
            <div className="mb-4 flex items-center gap-3">
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 20,
                  letterSpacing: "0.06em",
                  color: "var(--neon-cyan)",
                  textShadow: "2px 2px 0 #000",
                  margin: 0,
                }}
              >
                Upcoming
              </h2>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "var(--neon-cyan)",
                  background: "rgba(42,240,255,0.12)",
                  border: "2px solid var(--neon-cyan)",
                  padding: "2px 8px",
                  letterSpacing: "0.06em",
                }}
              >
                {upcomingEvents.length}
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isRsvped={rsvpedEvents.includes(event.id)}
                  onRsvp={() => toggleRsvp(event.id)}
                  onViewDetails={(ev) => setSelectedEvent(ev)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Past Events */}
        {!isLoading && pastEvents.length > 0 && (
          <section>
            <div className="mb-4 flex items-center gap-3">
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 20,
                  letterSpacing: "0.06em",
                  color: "var(--fg-muted)",
                  textShadow: "1px 1px 0 #000",
                  margin: 0,
                }}
              >
                Past Events
              </h2>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "var(--fg-muted)",
                  background: "rgba(154,160,208,0.12)",
                  border: "2px solid var(--fg-muted)",
                  padding: "2px 8px",
                  letterSpacing: "0.06em",
                }}
              >
                {pastEvents.length}
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" style={{ opacity: 0.7 }}>
              {pastEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isRsvped={rsvpedEvents.includes(event.id)}
                  onViewDetails={(ev) => setSelectedEvent(ev)}
                  // No RSVP for past events
                />
              ))}
            </div>
          </section>
        )}

        {/* Create Event Modal */}
        {canCreate && showCreateModal && (
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
                  aria-label="Close"
                  className="cursor-pointer border-2 border-black bg-[#16192b] px-2.5 py-1 text-sm font-bold text-white transition hover:bg-[#252a48]"
                  style={{ boxShadow: "2px 2px 0 #000" }}
                >
                  ✕
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
                  <p className="mb-1 font-semibold">About:</p>
                  <p className="comic-card p-4 leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                    {selectedEvent.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                {getEventDate(selectedEvent) >= now && (
                  <button
                    type="button"
                    onClick={() => toggleRsvp(selectedEvent.id)}
                    className="comic-btn"
                  >
                    {rsvpedEvents.includes(selectedEvent.id) ? "✓ Going" : "RSVP"}
                  </button>
                )}
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
