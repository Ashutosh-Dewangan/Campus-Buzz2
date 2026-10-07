"use client";

import { useEffect, useState } from "react";
import { Event, OfficialPost } from "@/types";
import {
  createOfficialPost,
  getEvents,
  updateEvent,
} from "@/lib/api";
import {
  getOrganizations,
  Organization,
} from "@/lib/api/organizations";
import { getSession } from "@/lib/session";
import { XIcon } from "@/components/ui/Icons";

interface CreateOfficialPostProps {
  onClose: () => void;
  onPostCreated?: (newPost: OfficialPost) => void;
}

export default function CreateOfficialPost({
  onClose,
  onPostCreated,
}: CreateOfficialPostProps) {
  const session = getSession();

  const [title, setTitle] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [content, setContent] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [link, setLink] = useState("");
  const [linkedEventId, setLinkedEventId] = useState("");

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  const [isLoadingOrganizations, setIsLoadingOrganizations] =
    useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOrganizations() {
      try {
        const allOrganizations = await getOrganizations();

        if (cancelled) return;

        const user = session?.user;

        if (!user) {
          setOrganizations([]);
          return;
        }

        if (user.role === "ADMIN") {
          setOrganizations(allOrganizations);
          return;
        }

        const activeMemberships = user.memberships ?? [];

        const memberOrganizationIds = new Set(
          activeMemberships
            .filter(
              (membership) =>
                membership.status === "ACTIVE",
            )
            .map(
              (membership) =>
                membership.organization.id,
            ),
        );

        setOrganizations(
          allOrganizations.filter((organization) =>
            memberOrganizationIds.has(organization.id),
          ),
        );
      } catch (err: unknown) {
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
  }, [session]);

  /*
   * Events are campus-visible, so all authenticated users can
   * retrieve them. We filter the selectable events by the
   * selected organization below.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      try {
        const data = await getEvents();

        if (!cancelled) {
          setEvents(data);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load events.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingEvents(false);
        }
      }
    }

    void loadEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const availableEvents = events.filter((event) => {
    if (!organizationId) {
      return false;
    }

    return event.organizationId === organizationId;
  });

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please enter a notice title.");
      return;
    }

    if (!organizationId) {
      setError("Please select the publishing organization.");
      return;
    }

    if (!content.trim()) {
      setError("Please enter the announcement content.");
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await createOfficialPost({
        title: title.trim(),
        content: content.trim(),
        organizationId,
        formUrl: formUrl.trim() || undefined,
        link: link.trim() || undefined,
      });

      /*
       * Official post creation and event linking are separate
       * backend operations because the official-post creation
       * endpoint does not accept linkedOfficialPostId.
       */
      if (linkedEventId) {
        try {
          await updateEvent(linkedEventId, {
            linkedOfficialPostId: created.id,
          });
        } catch (linkError) {
          setError(
            linkError instanceof Error
              ? `Notice created, but the event could not be linked: ${linkError.message}`
              : "Notice created, but the event could not be linked.",
          );

          onPostCreated?.(created);
          return;
        }
      }

      onPostCreated?.(created);
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create official post",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="official-modal-title"
    >
      <div
        className="comic-modal flex flex-col w-full max-w-lg max-h-[calc(100vh-32px)] sm:max-h-[calc(100vh-48px)] rounded-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 flex items-center justify-between border-b-2 border-black bg-[rgba(18,10,32,0.98)] px-4 py-3 sm:px-5">
          <div>
            <h2 id="official-modal-title" className="stay-loop-title text-lg sm:text-xl">
              Create Official Notice
            </h2>

            <p
              className="mt-0.5 text-xs text-[var(--neon-cyan)]"
            >
              Authorized Student Bodies &amp; Campus Announcements
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-sm border-2 border-black bg-[#16192b] hover:bg-[#252a48] text-white transition-colors cursor-pointer shadow-[2px_2px_0_#000]"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {error && (
            <div
              className="mb-4 border-2 border-black p-3 text-xs sm:text-sm font-bold shadow-[2px_2px_0_#000]"
              style={{
                background: "rgba(255,45,74,0.18)",
                color: "var(--accent)",
              }}
            >
              {error}
            </div>
          )}

          <form id="create-official-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="official-title"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider"
              style={{ color: "var(--neon-yellow)" }}
            >
              Notice Title *
            </label>

            <input
              id="official-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Placement Drive Registration Open"
              className="comic-input font-readable w-full px-4 py-2 text-sm"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="official-org"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider"
              style={{ color: "var(--neon-yellow)" }}
            >
              Publishing Body / Organization *
            </label>

            <select
              id="official-org"
              value={organizationId}
              onChange={(e) => {
                setOrganizationId(e.target.value);
                setLinkedEventId("");
              }}
              className="comic-input font-readable w-full px-4 py-2 text-sm"
              disabled={
                isLoadingOrganizations ||
                isSubmitting
              }
              required
            >
              <option value="">
                {isLoadingOrganizations
                  ? "Loading organizations..."
                  : "Select organization"}
              </option>

              {organizations.map((organization) => (
                <option
                  key={organization.id}
                  value={organization.id}
                >
                  {organization.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="official-event"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider"
              style={{ color: "var(--neon-yellow)" }}
            >
              Link Event (Optional)
            </label>

            <select
              id="official-event"
              value={linkedEventId}
              onChange={(e) =>
                setLinkedEventId(e.target.value)
              }
              className="comic-input font-readable w-full px-4 py-2 text-sm"
              disabled={
                isSubmitting ||
                isLoadingEvents ||
                !organizationId
              }
            >
              <option value="">
                {isLoadingEvents
                  ? "Loading events..."
                  : !organizationId
                    ? "Select an organization first"
                    : "No linked event"}
              </option>

              {availableEvents.map((event) => (
                <option
                  key={event.id}
                  value={event.id}
                >
                  {event.name}
                </option>
              ))}
            </select>

            <p
              className="mt-1 text-xs"
              style={{ color: "var(--neon-cyan)" }}
            >
              Optionally connect this notice to an event
              on the campus calendar.
            </p>
          </div>

          <div>
            <label
              htmlFor="official-content"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider"
              style={{ color: "var(--neon-yellow)" }}
            >
              Notice Content *
            </label>

            <textarea
              id="official-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Important notice details, instructions, deadlines..."
              className="comic-input font-readable w-full px-4 py-2 text-sm leading-relaxed"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="official-form-url"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider"
              style={{ color: "var(--neon-yellow)" }}
            >
              Form / Registration URL (Optional)
            </label>

            <input
              id="official-form-url"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              type="url"
              placeholder="https://forms.google.com/..."
              className="comic-input w-full px-4 py-2 text-sm"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="official-link"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider"
              style={{ color: "var(--neon-yellow)" }}
            >
              Additional Link (Optional)
            </label>

            <input
              id="official-link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              type="url"
              placeholder="https://campus-portal.example/..."
              className="comic-input w-full px-4 py-2 text-sm"
              disabled={isSubmitting}
            />
          </div>

          </form>
        </div>

        <div className="shrink-0 flex items-center justify-end gap-3 border-t-2 border-black bg-[rgba(18,10,32,0.98)] px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="comic-btn-outline cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="create-official-form"
            disabled={
              isSubmitting ||
              isLoadingOrganizations ||
              organizations.length === 0
            }
            className="comic-btn disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting
              ? "Publishing..."
              : "Publish Notice ↗"}
          </button>
        </div>
      </div>
    </div>
  );
}