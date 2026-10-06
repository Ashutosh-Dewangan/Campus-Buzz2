import { Event } from "@/types";

import {
  getStoredEvents,
  saveStoredEvents,
} from "./storage";
import { getSession } from "@/lib/session";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

function getAuthHeaders(): HeadersInit {
  const session = getSession();

  if (!session?.token) {
    return {};
  }

  return {
    Authorization: `Bearer ${session.token}`,
  };
}

async function getErrorMessage(
  response: Response,
): Promise<string> {
  try {
    const data = await response.json();

    if (
      data?.message &&
      typeof data.message === "string"
    ) {
      return data.message;
    }

    if (
      data?.error &&
      typeof data.error === "string"
    ) {
      return data.error;
    }
  } catch {
    // Ignore invalid/non-JSON error bodies.
  }

  if (response.status === 401) {
    return "Authentication required. Please sign in to continue.";
  }
  if (response.status === 403) {
    return "Permission denied. You do not have permission for this event operation.";
  }

  return `Request failed with status ${response.status}`;
}


export async function getEvents(): Promise<Event[]> {
  try {
    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 2000);

    try {
      const response = await fetch(
        `${API_URL}/api/events`,
        {
          method: "GET",
          headers: {
            ...getAuthHeaders(),
          },
          signal: controller.signal,
        },
      );

      if (response.ok) {
        const data = await response.json();

        // An empty array from the server is authoritative.
        if (Array.isArray(data)) {
          return data;
        }

        throw new Error(
          "Invalid events response",
        );
      }

      // Do NOT silently replace server errors with localStorage.
      throw new Error(
        await getErrorMessage(response),
      );
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "AbortError" ||
        error.message.toLowerCase().includes("fetch") ||
        error.message.toLowerCase().includes("networkerror"))
    ) {
      throw new Error("Unable to load events from the server. Please try again.");
    }
    throw error;
  }
}

export interface CreateEventInput {
  name: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  organizationId?: string;
  linkedOfficialPostId?: string;
}

export async function createEvent(
  event: CreateEventInput,
): Promise<Event> {
  try {
    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 2500);

    try {
      const response = await fetch(
        `${API_URL}/api/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(event),
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response),
        );
      }

      const created = await response.json();

      if (
        !created ||
        typeof created !== "object"
      ) {
        throw new Error(
          "Invalid event response",
        );
      }

      return created as Event;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.name !== "AbortError" &&
      !error.message
        .toLowerCase()
        .includes("fetch")
    ) {
      throw error;
    }
    throw new Error("Unable to reach the server. The event was not created. Please try again.");
  }
}

export interface UpdateEventInput {
  name?: string;
  date?: string;
  time?: string;
  venue?: string;
  description?: string;
  organizationId?: string | null;
  linkedOfficialPostId?: string | null;
}

export async function updateEvent(
  eventId: string,
  updates: UpdateEventInput,
): Promise<Event> {
  const response = await fetch(
    `${API_URL}/api/events/${encodeURIComponent(eventId)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(updates),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response),
    );
  }

  const updated = await response.json();

  if (
    !updated ||
    typeof updated !== "object"
  ) {
    throw new Error(
      "Invalid event response",
    );
  }

  return updated as Event;
}

export async function deleteEvent(
  eventId: string,
): Promise<void> {
  try {
    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 2000);

    try {
      const response = await fetch(
        `${API_URL}/api/events/${encodeURIComponent(eventId)}`,
        {
          method: "DELETE",
          headers: {
            ...getAuthHeaders(),
          },
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response),
        );
      }
    } finally {
      clearTimeout(timeoutId);
    }

    // Only update local cache after successful server deletion.
    const current = getStoredEvents();

    saveStoredEvents(
      current.filter(
        (event) => event.id !== eventId,
      ),
    );
  } catch (error) {
    /*
     * A server-side 403/404/500 must NOT be treated
     * as an offline deletion.
     */
    if (
      error instanceof Error &&
      error.name !== "AbortError" &&
      !error.message
        .toLowerCase()
        .includes("fetch")
    ) {
      throw error;
    }

    throw error;
  }
}

export async function rsvpEvent(
  eventId: string,
): Promise<boolean> {
  const session = getSession();
  const userId =
    session?.user?.id || "u-current";

  const key = `cb_rsvp_${userId}`;

  let list: string[] = [];

  try {
    const raw = localStorage.getItem(key);
    list = raw ? JSON.parse(raw) : [];
  } catch {
    list = [];
  }

  const isRsvped = list.includes(eventId);

  const updated = isRsvped
    ? list.filter((id) => id !== eventId)
    : [...list, eventId];

  try {
    localStorage.setItem(
      key,
      JSON.stringify(updated),
    );
  } catch {
    // No-op.
  }

  return !isRsvped;
}

export function getUserRsvps(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  const session = getSession();

  const userId =
    session?.user?.id || "u-current";

  const key = `cb_rsvp_${userId}`;

  try {
    const raw = localStorage.getItem(key);

    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
