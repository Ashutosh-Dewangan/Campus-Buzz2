import { OfficialPost } from "@/types";
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

export async function getOfficialPosts(): Promise<
  OfficialPost[]
> {
  const response = await fetch(
    `${API_URL}/api/official`,
    {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    let message = `Failed to load official posts (${response.status})`;

    if (response.status === 401) {
      message = "Authentication required. Please sign in to view official announcements.";
    } else if (response.status === 403) {
      message = "Access forbidden. You do not have permission to view official announcements.";
    } else {
      try {
        const data = await response.json();
        if (typeof data?.message === "string") {
          message = data.message;
        } else if (typeof data?.error === "string") {
          message = data.error;
        }
      } catch {
        // Keep the default message.
      }
    }

    throw new Error(message);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error(
      "Invalid official posts response",
    );
  }

  return data as OfficialPost[];
}

export interface CreateOfficialPostInput {
  title: string;
  content: string;
  organizationId: string;
  link?: string;
  formUrl?: string;
}

export async function createOfficialPost(
  post: CreateOfficialPostInput,
): Promise<OfficialPost> {
  const session = getSession();

  if (!session?.token) {
    throw new Error(
      "Authentication required",
    );
  }

  const response = await fetch(
    `${API_URL}/api/official`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({
        title: post.title,
        content: post.content,
        organizationId: post.organizationId,
        link: post.link || undefined,
        formUrl:
          post.formUrl || undefined,
      }),
    },
  );

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    // Response may not contain JSON.
  }

  if (!response.ok) {
    let message = `Failed to create official post (${response.status})`;

    if (response.status === 401) {
      message = "Authentication required. Please sign in to publish official announcements.";
    } else if (response.status === 403) {
      message = "Forbidden. Only authorized club and committee leaders or administrators can publish official announcements.";
    } else if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      message = data.message;
    }

    throw new Error(message);
  }


  /*
   * Backend returns:
   *
   * {
   *   message: "...",
   *   post: { ... }
   * }
   *
   * The frontend must return the actual post object.
   */
  if (
    typeof data !== "object" ||
    data === null ||
    !("post" in data) ||
    !data.post ||
    typeof data.post !== "object"
  ) {
    throw new Error(
      "Invalid official post response",
    );
  }

  return data.post as OfficialPost;
}
export async function deleteOfficialPost(
  officialPostId: string,
): Promise<void> {
  const session = getSession();

  if (!session?.token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(
    `${API_URL}/api/official/${encodeURIComponent(officialPostId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    },
  );

  if (!response.ok) {
    let message = `Failed to delete official post (${response.status})`;

    try {
      const data = await response.json();

      if (typeof data?.message === "string") {
        message = data.message;
      }
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }
}