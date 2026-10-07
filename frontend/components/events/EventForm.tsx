"use client";

import { useCurrentUser } from "@/lib/session";
import { useEffect, useState } from "react";
import { Event, OfficialPost } from "@/types";
import {
  createEvent,
  getOfficialPosts,
  getOrganizations,
} from "@/lib/api";
import { AlertCircleIcon, XIcon } from "@/components/ui/Icons";

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
  const [linkedOfficialPostId, setLinkedOfficialPostId] = useState("");

  const [organizations, setOrganizations] = useState<
    Awaited<ReturnType<typeof getOrganizations>>
  >([]);

  const [officialPosts, setOfficialPosts] = useState<OfficialPost[]>([]);

  const [isLoadingOrganizations, setIsLoadingOrganizations] =
    useState(false);

  const [isLoadingOfficialPosts, setIsLoadingOfficialPosts] =
    useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = currentUser?.role === "ADMIN";

  const memberships =
    currentUser?.memberships?.filter(
      (membership) => membership.status === "ACTIVE",
    ) ?? [];

  /*
   * Admins can choose from all organizations.
   * Students do not need the organizations endpoint because
   * they can only create events for their active memberships.
   */
  useEffect(() => {
  if (!isAdmin) {
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

  /*
   * Official notices are visible campus-wide, so all authenticated
   * users can fetch them. We filter them below according to the
   * organization selected for the event.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadOfficialPosts() {
      setIsLoadingOfficialPosts(true);

      try {
        const posts = await getOfficialPosts();

        if (!cancelled) {
          setOfficialPosts(posts);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load official notices.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingOfficialPosts(false);
        }
      }
    }

    void loadOfficialPosts();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Only notices belonging to the selected organization can be
   * linked to an organization event.
   *
   * For a campus-wide admin event, all official notices are available.
   */
  const availableOfficialPosts = officialPosts.filter((post) => {
    if (isAdmin && !organizationId) {
      return true;
    }

    if (!organizationId) {
      return false;
    }

    return post.organizationId === organizationId;
  });

  /*
   * If the organization changes and the selected official notice
   * no longer belongs to that organization, clear the selection.
   */

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
        linkedOfficialPostId:
          linkedOfficialPostId || undefined,
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

  // Lock background scrolling and attach ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-event-modal-title"
    >
      <div
        className="comic-modal flex flex-col w-full max-w-lg max-h-[calc(100vh-32px)] sm:max-h-[calc(100vh-48px)] rounded-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="shrink-0 flex items-center justify-between border-b-2 border-black bg-[rgba(18,10,32,0.98)] px-4 py-3 sm:px-5">
          <div>
            <h2
              id="create-event-modal-title"
              className="text-base font-black uppercase tracking-wider text-[var(--neon-cyan)] sm:text-lg"
            >
              Create Event
            </h2>
            <p className="font-readable text-xs text-[var(--fg-muted)]">
              Add an official or student event to the campus calendar.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-sm border-2 border-black bg-[#16192b] text-[var(--fg-muted)] hover:text-white hover:bg-[#252a48] transition-colors shadow-[2px_2px_0_#000] focus-visible:outline-2 focus-visible:outline-[var(--neon-cyan)] cursor-pointer"
            aria-label="Close Create Event dialog"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Form with scrollable body and pinned footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-sm border-2 border-black bg-[rgba(255,45,74,0.18)] p-3 text-xs font-bold text-[var(--accent)] shadow-[2px_2px_0_#000]">
                <AlertCircleIcon className="h-4 w-4 shrink-0" />
                <span className="font-readable">{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="event-name"
                className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-[var(--neon-yellow)]"
              >
                Event Name <span className="text-[var(--accent)]">*</span>
              </label>
              <input
                id="event-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Campus Tech Meetup"
                className="comic-input font-readable w-full px-3 py-2 text-xs text-[var(--fg)] outline-none"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="event-date"
                  className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-[var(--neon-yellow)]"
                >
                  Date <span className="text-[var(--accent)]">*</span>
                </label>
                <input
                  id="event-date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="comic-input font-readable w-full px-3 py-2 text-xs text-[var(--fg)] outline-none"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="event-time"
                  className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-[var(--neon-yellow)]"
                >
                  Time <span className="text-[var(--accent)]">*</span>
                </label>
                <input
                  id="event-time"
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  className="comic-input font-readable w-full px-3 py-2 text-xs text-[var(--fg)] outline-none"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="event-venue"
                className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-[var(--neon-yellow)]"
              >
                Venue <span className="text-[var(--accent)]">*</span>
              </label>
              <input
                id="event-venue"
                type="text"
                value={venue}
                onChange={(event) => setVenue(event.target.value)}
                placeholder="e.g. Main Auditorium / SAC Amphitheater"
                className="comic-input font-readable w-full px-3 py-2 text-xs text-[var(--fg)] outline-none"
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <label
                htmlFor="event-organization"
                className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-[var(--neon-yellow)]"
              >
                Organization {isAdmin ? "(Optional)" : <span className="text-[var(--accent)]">*</span>}
              </label>
              <select
                id="event-organization"
                value={organizationId}
                onChange={(event) => {
                  setOrganizationId(event.target.value);
                  setLinkedOfficialPostId("");
                }}
                className="comic-input font-readable w-full px-3 py-2 text-xs text-[var(--fg)] outline-none"
                disabled={isSubmitting || (isAdmin && isLoadingOrganizations)}
              >
                {isAdmin && <option value="">Campus-wide event</option>}
                {!isAdmin && (
                  <option value="" disabled>
                    Select organization
                  </option>
                )}
                {isAdmin
                  ? organizations.map((organization) => (
                      <option key={organization.id} value={organization.id}>
                        {organization.name}
                      </option>
                    ))
                  : memberships.map((membership) => (
                      <option key={membership.organization.id} value={membership.organization.id}>
                        {membership.organization.name}
                      </option>
                    ))}
              </select>
              {isAdmin ? (
                <p className="font-readable mt-1 text-[11px] text-[var(--fg-muted)]">
                  Admins can create campus-wide events or host on behalf of an organization.
                </p>
              ) : memberships.length === 0 ? (
                <p className="font-readable mt-1 text-[11px] text-[var(--accent)]">
                  You need an active organization membership to create events.
                </p>
              ) : (
                <p className="font-readable mt-1 text-[11px] text-[var(--fg-muted)]">
                  You can create events only for organizations where you are an active member.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="event-official-post"
                className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-[var(--neon-yellow)]"
              >
                Link Official Notice (Optional)
              </label>
              <select
                id="event-official-post"
                value={linkedOfficialPostId}
                onChange={(event) => setLinkedOfficialPostId(event.target.value)}
                className="comic-input font-readable w-full px-3 py-2 text-xs text-[var(--fg)] outline-none"
                disabled={isSubmitting || isLoadingOfficialPosts}
              >
                <option value="">
                  {isLoadingOfficialPosts
                    ? "Loading official notices..."
                    : "No linked notice"}
                </option>
                {availableOfficialPosts.map((post) => (
                  <option key={post.id} value={post.id}>
                    {post.title} — {post.organization.name}
                  </option>
                ))}
              </select>
              <p className="font-readable mt-1 text-[11px] text-[var(--fg-muted)]">
                Optionally link this event to a published official campus circular.
              </p>
            </div>

            <div>
              <label
                htmlFor="event-description"
                className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-[var(--neon-yellow)]"
              >
                Description <span className="text-[var(--accent)]">*</span>
              </label>
              <textarea
                id="event-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe schedule, registration info, eligibility, and highlights..."
                rows={4}
                className="comic-input font-readable w-full resize-none px-3 py-2 text-xs leading-relaxed text-[var(--fg)] outline-none"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          {/* Pinned Footer Actions */}
          <div className="shrink-0 flex items-center justify-end gap-3 border-t-2 border-black bg-[rgba(18,10,32,0.98)] px-4 py-3 sm:px-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="retro-btn-outline min-h-[40px] px-4 py-2 text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="retro-btn min-h-[40px] px-5 py-2 text-xs font-black cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Event ↗"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}