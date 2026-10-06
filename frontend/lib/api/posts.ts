import { Post } from "@/types";
import { getStoredPosts, saveStoredPosts } from "./storage";
import { getSession } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getAuthHeaders(): HeadersInit {
  const session = getSession();
  if (!session?.token) return {};
  return { Authorization: `Bearer ${session.token}` };
}

interface BackendPost {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  hashtags?: Array<{ hashtag?: { name: string } }>;
  interactionType: Post["interactionType"];
  author?: { name?: string; id?: string };
  createdAt: string;
  expiresAt?: string | null;
  status: "ACTIVE" | "CLOSED";
  contactName?: string;
  contactPhone?: string;
  chatRoom?: { id: string; status: string; createdAt: string; closedAt?: string | null } | null;
}

function mapBackendPost(post: BackendPost): Post {
  return {
    id: post.id,
    image: post.imageUrl?.startsWith("http")
      ? post.imageUrl
      : `${API_URL}${post.imageUrl}`,
    title: post.title,
    description: post.description,
    hashtags:
      post.hashtags?.flatMap((item) =>
        item.hashtag?.name ? [item.hashtag.name] : []
      ) ?? [],
    interactionType: post.interactionType,
    author: post.author?.name ?? "Unknown",
    authorId: post.author?.id,
    contactName: post.contactName,
    contactPhone: post.contactPhone,
    createdAt: post.createdAt,
    expiresAt: post.expiresAt ?? undefined,
    status: post.status,
    chatRoomId: post.chatRoom?.id,
  };
}

export async function getPosts(): Promise<Post[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${API_URL}/api/posts`, {
      headers: { ...getAuthHeaders() },
      cache: "no-store",
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return data.map(mapBackendPost);
      }
      throw new Error("Invalid posts data received from server");
    }

    if (response.status === 401) {
      throw new Error("Authentication required. Please sign in to view posts.");
    }

    if (response.status === 403) {
      throw new Error("Access forbidden. You do not have permission to view posts.");
    }

    const errData = await response.json().catch(() => null);
    throw new Error(errData?.message || `Failed to fetch posts (${response.status})`);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "AbortError" ||
        error.message.toLowerCase().includes("fetch") ||
        error.message.toLowerCase().includes("networkerror") ||
        error.message.toLowerCase().includes("failed to fetch"))
    ) {
      throw new Error("Unable to load Campus Buzz from the server. Please try again.");
    }
    throw error;
  }
}

export async function createPost(data: FormData): Promise<Post> {
  const rawHashtags = (data.get("hashtags") as string) || "[]";
  let hashtags: string[] = [];
  try {
    hashtags = JSON.parse(rawHashtags);
  } catch {
    hashtags = [];
  }
  const primaryHashtag = hashtags[0] || "";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${API_URL}/api/posts`, {
      method: "POST",
      headers: { ...getAuthHeaders() },
      body: data,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (response.ok) {
      const res = await response.json();
      if (res.post) {
        const mapped = mapBackendPost(res.post);
        const current = getStoredPosts();
        saveStoredPosts([mapped, ...current]);
        return mapped;
      }
      throw new Error("Invalid post response received from server");
    }

    const errData = await response.json().catch(() => null);
    let errMsg = errData?.message || `Server rejected post (${response.status})`;

    if (response.status === 400 && errData?.errors && Array.isArray(errData.errors)) {
      const hasResellContactMismatch =
        primaryHashtag === "#resell" &&
        errData.errors.some(
          (e: { path?: string[]; message?: string }) =>
            e.path?.includes("contactName") || e.path?.includes("contactPhone")
        );

      if (hasResellContactMismatch) {
        errMsg =
          "Backend validation limitation: The current backend contract requires contact details for #resell posts, but room-based coordination is specified. This operation is blocked by backend validation.";
      } else {
        const fieldErrors = errData.errors
          .map((e: { message?: string }) => e.message)
          .filter(Boolean)
          .join(", ");
        if (fieldErrors) errMsg = `${errMsg}: ${fieldErrors}`;
      }
    } else if (response.status === 401) {
      errMsg = "Authentication required. Please sign in to publish a post.";
    } else if (response.status === 403) {
      errMsg = "Only student accounts have permission to create Campus Buzz posts.";
    } else if (response.status === 413) {
      errMsg = "Uploaded image exceeds the 5MB size limit.";
    }

    throw new Error(errMsg);
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      (err.name === "AbortError" ||
        err.message.toLowerCase().includes("fetch") ||
        err.message.toLowerCase().includes("networkerror"))
    ) {
      throw new Error(
        "Unable to reach the server to publish your post. Please check your internet connection."
      );
    }
    throw err;
  }
}


export async function getPostContact(
  postId: string
): Promise<{ contactName: string; contactPhone: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(
      `${API_URL}/api/posts/${encodeURIComponent(postId)}/contact`,
      {
        headers: { ...getAuthHeaders() },
        signal: controller.signal,
      }
    ).finally(() => clearTimeout(timeoutId));

    if (response.ok) {
      return await response.json();
    }

    if (response.status === 401) {
      throw new Error("Authentication required to view contact details.");
    }

    if (response.status === 403) {
      throw new Error("Access forbidden. You do not have permission to view contact details.");
    }

    if (response.status === 404) {
      throw new Error("Contact information is not available for this post.");
    }


    const errData = await response.json().catch(() => null);
    throw new Error(
      errData?.message || `Failed to fetch contact details (${response.status})`
    );
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "AbortError" ||
        error.message.toLowerCase().includes("fetch") ||
        error.message.toLowerCase().includes("networkerror"))
    ) {
      throw new Error("Unable to load contact information from the server. Please try again.");
    }
    throw error;
  }
}

export function getTrendingTags(posts: Post[]): Array<{ tag: string; count: number }> {
  const counts: Record<string, number> = {};
  for (const post of posts) {
    if (post.status === "ACTIVE") {
      for (const t of post.hashtags) {
        counts[t] = (counts[t] || 0) + 1;
      }
    }
  }
  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}
