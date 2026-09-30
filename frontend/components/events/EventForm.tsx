"use client";

import { useCurrentUser } from "@/lib/session";
import { useEffect, useState } from "react";
import { Event } from "@/types";
import { createEvent, getOrganizations } from "@/lib/api";

interface EventFormProps {
  onClose: () => void;
  onEventCreated?: (newEvent: Event) => void;
}

export default function EventForm({
  onClose,
  onEventCreated,
}: EventFormProps) {
  const currentUser = useCurrentUser();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [organizations, setOrganizations] = useState<
  Awaited<ReturnType<typeof getOrganizations>>
>([]);
const [isLoadingOrganizations, setIsLoadingOrganizations] =
  useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const isAdmin = currentUser?.role === "ADMIN";
  const memberships =
    currentUser?.memberships?.filter(
      (membership) => membership.status === "ACTIVE",
    ) ?? [];

    useEffect(() => {
      if (!isAdmin) {
        setOrganizations([]);
        return;
      }
    
      let cancelled = false;
    
      async function loadOrganizations() {
        setIsLoadingOrganizations(true);
    
        try {
          const data = await getOrganizations();
    
          if (!cancelled) {
            setOrganizations(data);
          }
        } catch (err) {
          if (!cancelled) {
            setError(
              err instanceof Error
                ? err.message
                : "Failed to load organizations.",
            );
          }
        } finally {
          if (!cancelled) {
            setIsLoadingOrganizations(false);
          }
        }
      }
    
      void loadOrganizations();
    
      return () => {
        cancelled = true;
      };
    }, [isAdmin]);
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Event name is required.");
      return;
    }

    if (!date.trim()) {
      setError("Event date is required.");
      return;
    }

    if (!time.trim()) {
      setError("Event time is required.");
      return;
    }

    if (!venue.trim()) {
      setError("Venue is required.");
      return;
    }

    if (!description.trim()) {
      setError("Event description is required.");
      return;
    }

    if (!isAdmin && memberships.length === 0) {
      setError(
        "You need an active club or committee membership to create an event.",
      );
      return;
    }

    if (!isAdmin && !organizationId) {
      setError("Please select an organization.");
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
        organizationId: organizationId || undefined,
      });

      onEventCreated?.(created);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create event.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              Create Event
            </h2>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Add an event to the campus calendar.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="event-name"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Event Name
            </label>

            <input
              id="event-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Campus Tech Meetup"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="event-date"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Date
              </label>

              <input
                id="event-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="event-time"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Time
              </label>

              <input
                id="event-time"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="event-venue"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Venue
            </label>

            <input
              id="event-venue"
              type="text"
              value={venue}
              onChange={(event) => setVenue(event.target.value)}
              placeholder="e.g. Main Auditorium"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="event-organization"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Organization
            </label>

            <select
              id="event-organization"
              value={organizationId}
              onChange={(event) =>
                setOrganizationId(event.target.value)
              }
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
              disabled={isSubmitting || (isAdmin && isLoadingOrganizations)}
            >
              {isAdmin && (
                <option value="">
                  Campus-wide event
                </option>
              )}

              {!isAdmin && (
                <option value="" disabled>
                  Select organization
                </option>
              )}

            {isAdmin
              ? organizations.map((organization) => (
                  <option
                    key={organization.id}
                    value={organization.id}
                  >
                    {organization.name}
                  </option>
                ))
              : memberships.map((membership) => (
                  <option
                    key={membership.organization.id}
                    value={membership.organization.id}
                  >
                    {membership.organization.name}
                  </option>
                ))}
              </select>
            {isAdmin ? (
              <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                Admins can create campus-wide events or create
                events on behalf of an organization.
              </p>
            ) : memberships.length === 0 ? (
              <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                You need an active organization membership to
                create events.
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                You can create events only for organizations
                where you are an active member.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="event-description"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Description
            </label>

            <textarea
              id="event-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Describe the event..."
              rows={5}
              className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isSubmitting ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}