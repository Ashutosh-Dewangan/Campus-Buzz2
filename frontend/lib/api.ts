import {
  Complaint,
  Event,
  OfficialPost,
  Post,
} from "@/types";

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
  response: Response
): Promise<string> {
  const data =
    await response.json().catch(() => null);

  if (
    data &&
    typeof data.error === "string"
  ) {
    return data.error;
  }

  if (
    data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  return `Request failed with status ${response.status}`;
}

function mapPost(post: any): Post {
  return {
    id: post.id,
    image: post.imageUrl,
    title: post.title,
    description: post.description,
    hashtags:
      post.hashtags?.map(
        (item: any) => item.hashtag?.name
      ) ?? [],
    interactionType: post.interactionType,
    author: post.author?.name ?? "Unknown",
    createdAt: post.createdAt,
    expiresAt: post.expiresAt ?? undefined,
    status: post.status,
  };
}

export async function getPosts(): Promise<Post[]> {
  const response = await fetch(
    `${API_URL}/api/posts`,
    {
      headers: {
        ...getAuthHeaders(),
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response)
    );
  }

  const data = await response.json();

  return Array.isArray(data)
    ? data.map(mapPost)
    : [];
}

export async function createPost(
  data: FormData
): Promise<Post> {
  const response = await fetch(
    `${API_URL}/api/posts`,
    {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
      },
      body: data,
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response)
    );
  }

  const responseData =
    await response.json();

  return mapPost(responseData.post);
}

export async function getEvents(): Promise<Event[]> {
  const response = await fetch(
    `${API_URL}/api/events`
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response)
    );
  }

  return response.json();
}

export async function createEvent(
  event: Omit<Event, "id">
): Promise<Event> {
  const response = await fetch(
    `${API_URL}/api/events`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response)
    );
  }

  return response.json();
}

export async function getComplaints(): Promise<Complaint[]> {
  const response = await fetch(
    `${API_URL}/api/complaints`
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response)
    );
  }

  return response.json();
}

export async function createComplaint(
  complaint: {
    title: string;
    description: string;
  }
): Promise<Complaint> {
  const response = await fetch(
    `${API_URL}/api/complaints`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(
        complaint
      ),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response)
    );
  }

  return response.json();
}

export async function resolveComplaint(
  id: string
): Promise<Complaint> {
  const response = await fetch(
    `${API_URL}/api/complaints/${id}/resolve`,
    {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response)
    );
  }

  return response.json();
}

export async function getOfficialPosts(): Promise<OfficialPost[]> {
  const response = await fetch(
    `${API_URL}/api/official`
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response)
    );
  }

  return response.json();
}

export async function getPostContact(
  postId: string
): Promise<{
  contactName: string;
  contactPhone: string;
}> {
  const response = await fetch(
    `${API_URL}/api/posts/${encodeURIComponent(
      postId
    )}/contact`,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response)
    );
  }

  const data =
    await response.json();

  return data;
}

export async function createOfficialPost(
  post: {
    organization: string;
    content: string;
    formUrl?: string;
    eventName?: string;
  }
): Promise<OfficialPost> {
  const response = await fetch(
    `${API_URL}/api/official`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(post),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response)
    );
  }

  return response.json();
}