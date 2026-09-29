import { OfficialPost } from "@/types";
import { getStoredOfficialPosts, saveStoredOfficialPosts } from "./storage";
import { getSession } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getAuthHeaders(): HeadersInit {
  const session = getSession();
  if (!session?.token) return {};
  return { Authorization: `Bearer ${session.token}` };
}

export async function getOfficialPosts(): Promise<OfficialPost[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${API_URL}/api/official`, {
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

  return getStoredOfficialPosts();
}

export async function createOfficialPost(post: {
  organization: string;
  content: string;
  formUrl?: string;
  eventName?: string;
  link?: string;
}): Promise<OfficialPost> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(`${API_URL}/api/official`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(post),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (response.ok) {
      const created = await response.json();
      const current = getStoredOfficialPosts();
      saveStoredOfficialPosts([created, ...current]);
      return created;
    } else {
      const err = await response.json().catch(() => null);
      if (response.status === 401 || response.status === 403) {
        throw new Error(err?.message || "Not authorized to publish official announcements.");
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && !err.name.includes("Abort") && !err.message.includes("fetch")) {
      throw err;
    }
    // Offline fallback below
  }

  const newPost: OfficialPost = {
    id: `o-${Date.now()}`,
    organization: post.organization,
    content: post.content,
    formUrl: post.formUrl,
    eventName: post.eventName,
    link: post.link,
    createdAt: new Date().toISOString(),
  };

  const current = getStoredOfficialPosts();
  saveStoredOfficialPosts([newPost, ...current]);
  return newPost;
}
