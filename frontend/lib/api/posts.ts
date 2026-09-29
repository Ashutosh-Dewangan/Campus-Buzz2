import { Post } from "@/types";
import { getStoredPosts, saveStoredPosts, getStoredRooms, saveStoredRooms } from "./storage";
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
  };
}

export async function getPosts(): Promise<Post[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${API_URL}/api/posts`, {
      headers: { ...getAuthHeaders() },
      cache: "no-store",
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map(mapBackendPost);
      }
    }
  } catch {
    // Backend offline / timed out: fallback to local mock store
  }

  return getStoredPosts();
}

export async function createPost(data: FormData): Promise<Post> {
  const session = getSession();

  // Try sending to real backend if online
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

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
        // Sync into stored posts
        const current = getStoredPosts();
        saveStoredPosts([mapped, ...current]);
        return mapped;
      }
    } else {
      // Backend responded but actively rejected the request (e.g. 400 validation error, 401, 403, 422, 500)
      const errData = await response.json().catch(() => null);
      let errMsg = errData?.message || `Server rejected post (${response.status})`;
      if (errData?.errors && Array.isArray(errData.errors)) {
        const fieldErrors = errData.errors
          .map((e: { message?: string }) => e.message)
          .filter(Boolean)
          .join(", ");
        if (fieldErrors) errMsg = `${errMsg}: ${fieldErrors}`;
      }
      throw new Error(errMsg);
    }
  } catch (err: unknown) {
    // If it was an explicit server rejection from a running backend, rethrow it to show in UI
    if (err instanceof Error && !err.name.includes("Abort") && !err.message.includes("fetch") && !err.message.includes("NetworkError")) {
      throw err;
    }
    // Only fall back to local mock store when backend is unreachable/offline
  }

  // Parse fields from FormData for local store
  const title = (data.get("title") as string) || "Campus Buzz Post";
  const description = (data.get("description") as string) || "";
  const rawHashtags = (data.get("hashtags") as string) || "[]";
  let hashtags: string[] = [];
  try {
    hashtags = JSON.parse(rawHashtags);
  } catch {
    hashtags = ["#foodsplit"];
  }

  const primaryHashtag = hashtags[0] || "#foodsplit";
  let interactionType: Post["interactionType"] = "FOOD_SPLIT";
  if (primaryHashtag === "#cabsplit") interactionType = "CAB_SPLIT";
  else if (primaryHashtag === "#resell") interactionType = "RESELL";
  else if (primaryHashtag === "#lost") interactionType = "LOST";
  else if (primaryHashtag === "#found") interactionType = "FOUND";

  const expiresAt = (data.get("expiresAt") as string) || undefined;
  const contactName = (data.get("contactName") as string) || undefined;
  const contactPhone = (data.get("contactPhone") as string) || undefined;
  const price = (data.get("price") as string) || undefined;
  const itemCondition = (data.get("itemCondition") as string) || undefined;

  const imageFile = data.get("image") as File | null;
  let image = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=75";
  if (imageFile && typeof window !== "undefined") {
    try {
      image = URL.createObjectURL(imageFile);
    } catch {
      // fallback placeholder
    }
  }

  const author = session?.user?.email?.split("@")[0] || "Verified Student";
  const authorId = session?.user?.id || "u-current";

  const newPost: Post = {
    id: `post-${Date.now()}`,
    title,
    description,
    image,
    hashtags,
    interactionType,
    author,
    authorId,
    contactName,
    contactPhone,
    price,
    itemCondition,
    createdAt: new Date().toISOString(),
    expiresAt,
    status: "ACTIVE",
    resellStatus: interactionType === "RESELL" ? "AVAILABLE" : undefined,
  };

  const stored = getStoredPosts();
  saveStoredPosts([newPost, ...stored]);

  // If this post requires a coordination room, auto-initialize room in storage
  if (["FOOD_SPLIT", "CAB_SPLIT", "RESELL"].includes(interactionType)) {
    const currentRooms = getStoredRooms();
    const newRoom = {
      id: `r-${newPost.id}`,
      postId: newPost.id,
      name: newPost.title,
      creatorId: authorId,
      creatorName: author,
      status: "OPEN" as const,
      interactionType,
      members: [authorId],
      participants: [
        {
          id: authorId,
          name: author,
          role: interactionType === "RESELL" ? "Seller" : "Host",
          isOnline: true,
          isCreator: true,
        },
      ],
      resellStatus: interactionType === "RESELL" ? ("AVAILABLE" as const) : undefined,
    };
    saveStoredRooms([newRoom, ...currentRooms]);
  }

  return newPost;
}

export async function getPostContact(
  postId: string
): Promise<{ contactName: string; contactPhone: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

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
  } catch {
    // Offline fallback
  }

  const posts = getStoredPosts();
  const found = posts.find((p) => p.id === postId);
  if (found && (found.contactName || found.contactPhone)) {
    return {
      contactName: found.contactName || found.author,
      contactPhone: found.contactPhone || "+91 98765 43210 (Campus Verified)",
    };
  }

  return {
    contactName: found?.author || "Campus Student",
    contactPhone: "+91 98765 43210 (Verified Campus Contact)",
  };
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
