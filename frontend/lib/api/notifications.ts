import { NotificationItem } from "@/types";
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

async function handleResponse<T>(
  response: Response,
): Promise<T> {
  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(
      data?.error ||
        `Notification request failed (${response.status})`,
    );
  }

  return response.json() as Promise<T>;
}

export async function getNotifications(): Promise<
  NotificationItem[]
> {
  const response = await fetch(
    `${API_URL}/api/notifications`,
    {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    },
  );

  return handleResponse<NotificationItem[]>(
    response,
  );
}

export async function markNotificationRead(
  id: string,
): Promise<NotificationItem> {
  const response = await fetch(
    `${API_URL}/api/notifications/${id}/read`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    },
  );

  return handleResponse<NotificationItem>(
    response,
  );
}

export async function markAllNotificationsRead(): Promise<
  NotificationItem[]
> {
  const response = await fetch(
    `${API_URL}/api/notifications/read-all`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    },
  );

  return handleResponse<NotificationItem[]>(
    response,
  );
}