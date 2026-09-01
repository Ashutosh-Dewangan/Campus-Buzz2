import { Complaint, Event, OfficialPost, Post } from "@/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export async function getPosts(): Promise<Post[]> {
  const response = await fetch(
    `${API_URL}/api/posts`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }

  return response.json();
}

export async function createPost(data: FormData): Promise<Post> {
  const response = await fetch(
    `${API_URL}/api/posts`,
    {
      method: "POST",
      body: data,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create post");
  }

  return response.json();
}

export async function getEvents(): Promise<Event[]> {
  const response = await fetch(`${API_URL}/api/events`);
  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }
  return response.json();
}

export async function createEvent(event: Omit<Event, "id">): Promise<Event> {
  const response = await fetch(`${API_URL}/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create event");
  }
  return response.json();
}

export async function getComplaints(): Promise<Complaint[]> {
  const response = await fetch(`${API_URL}/api/complaints`);
  if (!response.ok) {
    throw new Error("Failed to fetch complaints");
  }
  return response.json();
}

export async function createComplaint(complaint: {
  title: string;
  description: string;
}): Promise<Complaint> {
  const response = await fetch(`${API_URL}/api/complaints`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(complaint),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create complaint");
  }
  return response.json();
}

export async function resolveComplaint(id: string): Promise<Complaint> {
  const response = await fetch(`${API_URL}/api/complaints/${id}/resolve`, {
    method: "PATCH",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to resolve complaint");
  }
  return response.json();
}

export async function getOfficialPosts(): Promise<OfficialPost[]> {
  const response = await fetch(`${API_URL}/api/official`);
  if (!response.ok) {
    throw new Error("Failed to fetch official posts");
  }
  return response.json();
}

export async function createOfficialPost(post: {
  organization: string;
  content: string;
  formUrl?: string;
  eventName?: string;
}): Promise<OfficialPost> {
  const response = await fetch(`${API_URL}/api/official`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create official post");
  }
  return response.json();
}