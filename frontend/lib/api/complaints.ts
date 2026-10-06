import { Complaint, ComplaintCategory } from "@/types";
import { getSession } from "@/lib/session";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getAuthHeaders(): HeadersInit {
  const session = getSession();

  if (!session?.token) {
    throw new Error("Authentication required");
  }

  return {
    Authorization: `Bearer ${session.token}`,
  };
}

const categoryToApi: Record<ComplaintCategory, string> = {
  Hostel: "HOSTEL",
  "Mess / Cafeteria": "MESS_CAFETERIA",
  "Campus Wi-Fi": "CAMPUS_WIFI",
  "Library / Facilities": "LIBRARY_FACILITIES",
  Academic: "ACADEMIC",
  Other: "OTHER",
};

const categoryFromApi: Record<string, ComplaintCategory> = {
  HOSTEL: "Hostel",
  MESS_CAFETERIA: "Mess / Cafeteria",
  CAMPUS_WIFI: "Campus Wi-Fi",
  LIBRARY_FACILITIES: "Library / Facilities",
  ACADEMIC: "Academic",
  OTHER: "Other",
};

function normalizeComplaint(data: unknown): Complaint {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid complaint response");
  }

  const complaint = data as Record<string, unknown>;

  return {
    id: String(complaint.id),
    title: String(complaint.title),
    description: String(complaint.description),
    category:
      categoryFromApi[String(complaint.category)] ??
      "Other",
    createdAt: String(complaint.createdAt),
    resolvedAt:
      complaint.resolvedAt === null ||
      complaint.resolvedAt === undefined
        ? null
        : String(complaint.resolvedAt),
    status:
      complaint.status === "RESOLVED"
        ? "RESOLVED"
        : "OPEN",
    isOwner:
      typeof complaint.isOwner === "boolean"
        ? complaint.isOwner
        : undefined,
    poster:
      complaint.poster &&
      typeof complaint.poster === "object"
        ? (complaint.poster as Complaint["poster"])
        : undefined,
  };
}

export async function getComplaints(): Promise<Complaint[]> {
  const response = await fetch(`${API_URL}/api/complaints`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Failed to load complaints (${response.status})`;

    if (response.status === 401) {
      message = "Authentication required. Please sign in to view complaints.";
    } else if (response.status === 403) {
      message = "Access forbidden. You do not have permission to view complaints.";
    } else {
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
    }

    throw new Error(message);
  }


  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Invalid complaints response");
  }

  return data.map(normalizeComplaint);
}

export async function createComplaint(complaint: {
  title: string;
  description: string;
  category?: ComplaintCategory;
}): Promise<Complaint> {
  const response = await fetch(`${API_URL}/api/complaints`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: complaint.title,
      description: complaint.description,
      category: categoryToApi[complaint.category ?? "Other"],
    }),
  });

  if (!response.ok) {
    let message = `Failed to create complaint (${response.status})`;

    if (response.status === 401) {
      message = "Authentication required. Please sign in to submit a complaint.";
    } else if (response.status === 403) {
      message = "Access forbidden. You do not have permission to submit complaints.";
    } else {
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
    }

    throw new Error(message);
  }

  return normalizeComplaint(await response.json());
}

export async function resolveComplaint(
  id: string
): Promise<Complaint> {
  const response = await fetch(
    `${API_URL}/api/complaints/${encodeURIComponent(id)}/resolve`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    let message = `Failed to resolve complaint (${response.status})`;

    if (response.status === 401) {
      message = "Authentication required. Please sign in to resolve complaints.";
    } else if (response.status === 403) {
      message = "You are not authorized to resolve this complaint. Only the original submitter or a campus administrator can resolve it.";
    } else {
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
    }
    throw new Error(message);
  }
  return normalizeComplaint(await response.json());
}