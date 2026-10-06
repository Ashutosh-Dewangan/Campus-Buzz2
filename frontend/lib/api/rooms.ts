import { ResellOffer, Room, RoomParticipant } from "@/types";
import { getSession } from "@/lib/session";

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

export interface ChatRoomData {
  id: string;
  postId: string;
  createdAt: string;
  closedAt: string | null;
  status: "OPEN" | "CLOSED";
  memberCount: number;
  isMember: boolean;
  isCreator: boolean;
  interactionType?: Room["interactionType"];
  participants: RoomParticipant[];
  offers?: ResellOffer[];
  resellStatus?: "AVAILABLE" | "RESERVED" | "SOLD";
  post: {
    id: string;
    authorId: string;
    title: string;
    description: string;
    interactionType: Room["interactionType"] | null;
    status: "ACTIVE" | "CLOSED";
    expiresAt: string | null;
    price?: string;
    itemCondition?: string;
    orderTotal?: number;
    splitCount?: number;
    seatsTotal?: number;
    seatsFilled?: number;
    departureTime?: string;
    pickupLocation?: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getAuthHeaders(): HeadersInit {
  const session = getSession();
  if (!session?.token) return {};
  return { Authorization: `Bearer ${session.token}` };
}

export async function getRooms(): Promise<Room[]> {
  // There is no backend room-list endpoint; the list is derived from the posts API.
  return [];
}

export async function getChatRoomByPost(postId: string): Promise<ChatRoomData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(
      `${API_URL}/api/chat/post/${encodeURIComponent(postId)}`,
      {
        headers: { ...getAuthHeaders() },
        cache: "no-store",
        signal: controller.signal,
      }
    ).finally(() => clearTimeout(timeoutId));

    if (response.ok) {
      const liveData = await response.json();
      return liveData;
    }

    if (response.status === 404) {
      throw new Error("Coordination room not found or has expired.");
    }

    if (response.status === 401) {
      throw new Error("Authentication required to view this room.");
    }

    if (response.status === 403) {
      throw new Error("Access forbidden. You do not have permission to view this room.");
    }

    const errData = await response.json().catch(() => null);
    throw new Error(
      errData?.message || `Failed to load coordination room (${response.status})`
    );

  } catch (err) {
    if (
      err instanceof Error &&
      !err.message.toLowerCase().includes("fetch") &&
      !err.message.toLowerCase().includes("networkerror") &&
      err.name !== "AbortError"
    ) {
      throw err;
    }
    throw new Error("Unable to load this coordination room from the server. Please try again.");
  }
}

export async function getChatMessages(roomId: string): Promise<ChatMessage[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(
      `${API_URL}/api/chat/${encodeURIComponent(roomId)}/messages`,
      {
        headers: { ...getAuthHeaders() },
        cache: "no-store",
        signal: controller.signal,
      }
    ).finally(() => clearTimeout(timeoutId));

    if (response.ok) {
      return await response.json();
    }

    if (response.status === 401) {
      throw new Error("Authentication required to view messages.");
    }

    if (response.status === 403) {
      throw new Error("Access forbidden. You do not have permission to view messages in this room.");
    }

    const errData = await response.json().catch(() => null);
    throw new Error(errData?.message || `Failed to load messages (${response.status})`);

  } catch (err) {
    if (
      err instanceof Error &&
      !err.message.toLowerCase().includes("fetch") &&
      !err.message.toLowerCase().includes("networkerror") &&
      err.name !== "AbortError"
    ) {
      throw err;
    }
    throw new Error("Unable to load messages from the server. Please try again.");
  }
}

export async function sendChatMessage(
  roomId: string,
  content: string
): Promise<ChatMessage> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(
      `${API_URL}/api/chat/${encodeURIComponent(roomId)}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ content }),
        signal: controller.signal,
      }
    ).finally(() => clearTimeout(timeoutId));

    if (response.ok) {
      const data = await response.json();
      return data.message;
    }

    if (response.status === 401) {
      throw new Error("Authentication required to send messages.");
    }

    if (response.status === 403) {
      throw new Error("Access forbidden. You do not have permission to send messages in this room.");
    }

    const errData = await response.json().catch(() => null);
    throw new Error(errData?.message || `Failed to send message (${response.status})`);
  } catch (err) {
    if (
      err instanceof Error &&
      !err.message.toLowerCase().includes("fetch") &&
      !err.message.toLowerCase().includes("networkerror") &&
      err.name !== "AbortError"
    ) {
      throw err;
    }

    throw new Error("Unable to reach the server. Your message was not sent. Please try again.");
  }
}

export async function closeChatRoom(roomId: string): Promise<ChatRoomData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(
      `${API_URL}/api/chat/${encodeURIComponent(roomId)}/close`,
      {
        method: "POST",
        headers: { ...getAuthHeaders() },
        signal: controller.signal,
      }
    ).finally(() => clearTimeout(timeoutId));

    if (response.ok) {
      const data = await response.json();
      return data.room;
    }

    if (response.status === 401) {
      throw new Error("Authentication required to close this room.");
    }

    if (response.status === 403) {
      throw new Error("Access forbidden. Only the host of this room can close it.");
    }

    const errData = await response.json().catch(() => null);
    throw new Error(errData?.message || `Failed to close room (${response.status})`);
  } catch (err) {
    if (
      err instanceof Error &&
      !err.message.toLowerCase().includes("fetch") &&
      !err.message.toLowerCase().includes("networkerror") &&
      err.name !== "AbortError"
    ) {
      throw err;
    }

    throw new Error("Unable to reach the server. The room was not closed. Please try again.");
  }
}

export async function joinChatRoom(roomId: string): Promise<void> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${API_URL}/api/chat/${encodeURIComponent(roomId)}/join`, {
      method: "POST",
      headers: { ...getAuthHeaders() },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (response.ok) {
      return;
    }

    if (response.status === 401) {
      throw new Error("Authentication required to join this room.");
    }

    if (response.status === 403) {
      throw new Error("Access forbidden. You do not have permission to join this room.");
    }

    const errData = await response.json().catch(() => null);
    throw new Error(errData?.message || `Failed to join room (${response.status})`);

  } catch (err) {
    if (
      err instanceof Error &&
      !err.message.toLowerCase().includes("fetch") &&
      !err.message.toLowerCase().includes("networkerror") &&
      err.name !== "AbortError"
    ) {
      throw err;
    }

    throw new Error("Unable to reach the server. You did not join the room. Please try again.");
  }
}

export async function leaveChatRoom(roomId: string): Promise<void> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${API_URL}/api/chat/${encodeURIComponent(roomId)}/leave`, {
      method: "POST",
      headers: { ...getAuthHeaders() },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (response.ok) {
      return;
    }

    if (response.status === 401) {
      throw new Error("Authentication required to leave this room.");
    }

    if (response.status === 403) {
      throw new Error("Access forbidden. You do not have permission to leave this room.");
    }

    const errData = await response.json().catch(() => null);
    throw new Error(errData?.message || `Failed to leave room (${response.status})`);

  } catch (err) {
    if (
      err instanceof Error &&
      !err.message.toLowerCase().includes("fetch") &&
      !err.message.toLowerCase().includes("networkerror") &&
      err.name !== "AbortError"
    ) {
      throw err;
    }

    throw new Error("Unable to reach the server. You have not left the room. Please try again.");
  }
}

export async function makeNegotiationOffer(
  roomId: string,
  amount: number
): Promise<ResellOffer> {
  void roomId;
  void amount;
  throw new Error("Resell offers are not supported by the current server.");
}

export async function updateOfferStatus(
  roomId: string,
  offerId: string,
  newStatus: "ACCEPTED" | "DECLINED"
): Promise<void> {
  void roomId;
  void offerId;
  void newStatus;
  throw new Error("Resell offers are not supported by the current server.");
}
