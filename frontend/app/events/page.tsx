"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import EventCard from "@/components/events/EventCard";
import EventForm from "@/components/events/EventForm";
import { CalendarIcon, CheckIcon, RefreshIcon, XIcon } from "@/components/ui/Icons";
import { Event } from "@/types";
import { getEvents, getUserRsvps, rsvpEvent, deleteEvent } from "@/lib/api";
import { isAdmin, canCreateEvent } from "@/lib/auth";

import { useCurrentUser } from "@/lib/session";
import { parseEventDate } from "@/lib/date";

function getEventDate(event: Event): Date {
  return parseEventDate(event.date, event.time);
}

function EventsContent() {
  const [events, setEvents] = useState<Event[]>([]);
  const [rsvpedEvents, setRsvpedEvents] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [explicitlySelectedEvent, setExplicitlySelectedEvent] = useState<Event | null>(null);
  const [urlEventDismissed, setUrlEventDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const eventIdFromUrl = searchParams.get("event");
  const user = useCurrentUser();

  const selectedEvent = useMemo(() => {
    if (explicitlySelectedEvent) return explicitlySelectedEvent;
    if (!urlEventDismissed && eventIdFromUrl && events.length > 0) {
      return events.find((item) => item.id === eventIdFromUrl) ?? null;
    }
    return null;
  }, [explicitlySelectedEvent, urlEventDismissed, eventIdFromUrl, events]);

  const isUserAdmin = user ? isAdmin(user.role) : false;
  const canCreate = user ? canCreateEvent(user.role, user.memberships ?? []) : false;

const canManageEvent = (event: Event) => {
  if (!user) {
    return false;
  }

  if (isUserAdmin) {
    return true;
  }

  if (!event.organizationId) {
    return false;
  }

  return (
    user.memberships?.some(
      (membership) =>
        membership.status === "ACTIVE" &&
        membership.organization.id === event.organizationId,
    ) ?? false
  );
};
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
        const [fetched, rsvps] = await Promise.all([
          getEvents(),
          Promise.resolve(getUserRsvps()),
        ]);
        if (!ignore && Array.isArray(fetched)) {
          setEvents(fetched);
          setRsvpedEvents(rsvps);
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

  function handleOpenDetails(ev: Event) {
    setExplicitlySelectedEvent(ev);
    setUrlEventDismissed(false);
  }

  function handleCloseDetails() {
    setExplicitlySelectedEvent(null);
    setUrlEventDismissed(true);
  }

  async function toggleRsvp(eventId: string) {
    const isNowGoing = await rsvpEvent(eventId);
    setRsvpedEvents((current) =>
      isNowGoing
        ? [...current, eventId]
        : current.filter((id) => id !== eventId)
    );
  }

  async function handleDeleteEvent(eventId: string) {
    await deleteEvent(eventId);
    setEvents((current) => current.filter((e) => e.id !== eventId));
    if (selectedEvent?.id === eventId) {
      handleCloseDetails();
    }
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

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/official/calendar"
              className="retro-btn-outline text-xs"
            >
              Month Calendar View →
            </Link>

            {canCreate && (
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="comic-btn text-xs"
              >
                + Create Event
              </button>
            )}
          </div>
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
              className="comic-btn mt-4 cursor-pointer inline-flex items-center gap-1.5"
            >
              <RefreshIcon className="h-3.5 w-3.5" />
              <span>Try again</span>
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && events.length === 0 && (
          <div className="comic-card comic-empty p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center border-2 border-black bg-black/40">
              <CalendarIcon className="h-6 w-6 text-[var(--neon-yellow)]" />
            </div>
            <h2 className="stay-loop-title mt-5">No events scheduled</h2>
            <p className="comic-sub mx-auto max-w-md">
              No upcoming workshops or campus activities right now. Check back soon!
            </p>
            {canCreate && (
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="comic-btn mt-5 cursor-pointer"
              >
                + Create Event
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
                  onViewDetails={handleOpenDetails}
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

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 opacity-75">
              {pastEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isRsvped={rsvpedEvents.includes(event.id)}
                  onViewDetails={handleOpenDetails}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="comic-modal p-6 rounded-sm max-w-md w-full">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "#000" }}>
                <h2 className="stay-loop-title" style={{ fontSize: 22 }}>
                  {selectedEvent.name}
                </h2>
                <button
                  type="button"
                  onClick={handleCloseDetails}
                  aria-label="Close"
                  className="cursor-pointer border-2 border-black bg-[#16192b] p-1.5 text-white transition hover:bg-[#252a48]"
                  style={{ boxShadow: "2px 2px 0 #000" }}
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="my-5 space-y-3 text-sm" style={{ color: "var(--fg)" }}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--neon-yellow)]">Date:</span>
                  <span>{selectedEvent.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--neon-yellow)]">Time:</span>
                  <span>{selectedEvent.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--neon-yellow)]">Venue:</span>
                  <span>{selectedEvent.venue}</span>
                </div>
                {selectedEvent.createdBy && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--neon-yellow)]">Organizer:</span>
                    <span>{selectedEvent.createdBy}</span>
                  </div>
                )}
                <div className="pt-2">
                  <p className="mb-1 font-semibold text-white">About Event:</p>
                  <p className="comic-card font-readable p-3 text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                    {selectedEvent.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t pt-3" style={{ borderColor: "#000" }}>
              <div>
              {canManageEvent(selectedEvent) && (
                <button
                  type="button"
                  onClick={() => void handleDeleteEvent(selectedEvent.id)}
                  className="text-xs font-bold text-[var(--accent)] hover:underline cursor-pointer"
                >
                  Delete Event
                </button>
              )}
              </div>
                <div className="flex items-center gap-2">
                  {getEventDate(selectedEvent) >= now && (
                    <button
                      type="button"
                      onClick={() => toggleRsvp(selectedEvent.id)}
                      className="comic-btn text-xs inline-flex items-center gap-1.5"
                    >
                      {rsvpedEvents.includes(selectedEvent.id) ? (
                        <>
                          <CheckIcon className="h-3.5 w-3.5 shrink-0" />
                          <span>Saved on Device</span>
                        </>
                      ) : (
                        "Save RSVP (This Device)"
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCloseDetails}
                    className="comic-btn-outline text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <main className="comic-page">
          <div className="mx-auto max-w-7xl">
            <div className="comic-card animate-pulse p-8 text-center">
              <p className="text-xs font-semibold text-[var(--neon-yellow)]">
                Loading campus events...
              </p>
            </div>
          </div>
        </main>
      }
    >
      <EventsContent />
    </Suspense>
  );
}
