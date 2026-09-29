import { Event } from "@/types";
import { getStoredEvents, saveStoredEvents } from "./storage";
import { getSession } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getAuthHeaders(): HeadersInit {
  const session = getSession();
  if (!session?.token) return {};
  return { Authorization: `Bearer ${session.token}` };
}

export async function getEvents(): Promise<Event[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${API_URL}/api/events`, {
      headers: { ...getAuthHeaders() },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // Offline fallback
  }

  return getStoredEvents();
}

export async function createEvent(
  event: Omit<Event, "id">
): Promise<Event> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(`${API_URL}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(event),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (response.ok) {
      const created = await response.json();
      const current = getStoredEvents();
      saveStoredEvents([created, ...current]);
      return created;
    }
  } catch {
    // Offline fallback
  }

  const newEvent: Event = {
    id: `e-${Date.now()}`,
    ...event,
  };

  const current = getStoredEvents();
  saveStoredEvents([newEvent, ...current]);
  return newEvent;
}

export async function deleteEvent(eventId: string): Promise<void> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    await fetch(`${API_URL}/api/events/${encodeURIComponent(eventId)}`, {
      method: "DELETE",
      headers: { ...getAuthHeaders() },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));
  } catch {
    // Offline fallback
  }

  const current = getStoredEvents();
  saveStoredEvents(current.filter((e) => e.id !== eventId));
}

export async function rsvpEvent(eventId: string): Promise<boolean> {
  const session = getSession();
  const userId = session?.user?.id || "u-current";
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
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {
    // no-op
  }

  return !isRsvped;
}

export function getUserRsvps(): string[] {
  if (typeof window === "undefined") return [];
  const session = getSession();
  const userId = session?.user?.id || "u-current";
  const key = `cb_rsvp_${userId}`;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
