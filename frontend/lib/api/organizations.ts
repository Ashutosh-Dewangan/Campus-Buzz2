import { getSession } from "@/lib/session";

export interface Organization {
  id: string;
  name: string;
  type: "CLUB" | "COMMITTEE";
  description?: string | null;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function getOrganizations(): Promise<Organization[]> {
  const session = getSession();

  if (!session?.token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_URL}/api/organizations`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const data = await response.json();

      if (typeof data?.message === "string") {
        message = data.message;
      } else if (typeof data?.error === "string") {
        message = data.error;
      }
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Invalid organizations response");
  }

  return data as Organization[];
}