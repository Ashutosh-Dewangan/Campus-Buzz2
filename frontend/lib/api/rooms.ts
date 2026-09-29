import { ResellOffer, Room, RoomParticipant } from "@/types";
import {
  getStoredMessages,
  getStoredPosts,
  getStoredRooms,
  saveStoredMessages,
  saveStoredPosts,
  saveStoredRooms,
} from "./storage";
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
  return getStoredRooms();
}

export async function getChatRoomByPost(postId: string): Promise<ChatRoomData> {
  const session = getSession();
  const currentUserId = session?.user?.id || "u-current";
  const currentUserName = session?.user?.email?.split("@")[0] || "Student";

  // Try real backend first if online
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

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
  } catch {
    // Offline fallback below
  }

  const posts = getStoredPosts();
  const post = posts.find((p) => p.id === postId);

  const rooms = getStoredRooms();
  let room = rooms.find((r) => r.postId === postId || r.id === postId);

  // If no room exists for this post yet, auto-generate one
  if (!room && post) {
    room = {
      id: `r-${post.id}`,
      postId: post.id,
      name: post.title,
      creatorId: post.authorId || "u-creator",
      creatorName: post.author,
      status: post.status === "ACTIVE" ? "OPEN" : "CLOSED",
      interactionType: post.interactionType,
      members: [post.authorId || "u-creator"],
      participants: [
        {
          id: post.authorId || "u-creator",
          name: post.author,
          role: post.interactionType === "RESELL" ? "Seller" : "Host",
          isOnline: true,
          isCreator: true,
        },
      ],
      resellStatus: post.interactionType === "RESELL" ? "AVAILABLE" : undefined,
    };
    saveStoredRooms([room, ...rooms]);
  }

  const isCreator =
    Boolean(room?.creatorId && room.creatorId === currentUserId) ||
    Boolean(post?.authorId && post.authorId === currentUserId) ||
    Boolean(post?.author && post.author.toLowerCase() === currentUserName.toLowerCase());

  const isMember = isCreator || (room?.members.includes(currentUserId) ?? true);

  const participants: RoomParticipant[] = room?.participants || [
    {
      id: post?.authorId || "u-creator",
      name: post?.author || "Host",
      role: post?.interactionType === "RESELL" ? "Seller" : "Host",
      isOnline: true,
      isCreator: true,
    },
  ];

  // If user is joined and not in participants list, add them
  if (isMember && !participants.some((p) => p.id === currentUserId)) {
    participants.push({
      id: currentUserId,
      name: currentUserName,
      role: "Member",
      isOnline: true,
      isCreator: false,
    });
  }

  return {
    id: room?.id || `r-${postId}`,
    postId,
    createdAt: post?.createdAt || new Date().toISOString(),
    closedAt: room?.status === "CLOSED" ? new Date().toISOString() : null,
    status: room?.status || "OPEN",
    memberCount: Math.max(participants.length, room?.members.length || 1),
    isMember,
    isCreator,
    interactionType: post?.interactionType || room?.interactionType || "FOOD_SPLIT",
    participants,
    offers: room?.offers || [],
    resellStatus: room?.resellStatus || "AVAILABLE",
    post: {
      id: post?.id || postId,
      authorId: post?.authorId || "u-creator",
      title: post?.title || "Coordination Post",
      description: post?.description || "",
      interactionType: post?.interactionType || "FOOD_SPLIT",
      status: post?.status || "ACTIVE",
      expiresAt: post?.expiresAt || null,
      price: post?.price,
      itemCondition: post?.itemCondition,
      orderTotal: post?.orderTotal,
      splitCount: post?.splitCount,
      seatsTotal: post?.seatsTotal,
      seatsFilled: post?.seatsFilled,
      departureTime: post?.departureTime,
      pickupLocation: post?.pickupLocation,
    },
  };
}

export async function getChatMessages(roomId: string): Promise<ChatMessage[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

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
  } catch {
    // Offline fallback
  }

  const allMessages = getStoredMessages();
  return allMessages[roomId] || [];
}

export async function sendChatMessage(
  roomId: string,
  content: string
): Promise<ChatMessage> {
  const session = getSession();
  const userId = session?.user?.id || "u-current";
  const userName = session?.user?.email?.split("@")[0] || "Verified Student";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

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
  } catch {
    // Offline fallback
  }

  const newMessage: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    chatRoomId: roomId,
    userId,
    content,
    createdAt: new Date().toISOString(),
    user: {
      id: userId,
      name: userName,
    },
  };

  const allMessages = getStoredMessages();
  const currentList = allMessages[roomId] || [];
  allMessages[roomId] = [...currentList, newMessage];
  saveStoredMessages(allMessages);

  return newMessage;
}

export async function closeChatRoom(roomId: string): Promise<ChatRoomData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

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
  } catch {
    // Offline fallback
  }

  const rooms = getStoredRooms();
  const roomIndex = rooms.findIndex((r) => r.id === roomId || `r-${r.postId}` === roomId);
  if (roomIndex >= 0) {
    rooms[roomIndex].status = "CLOSED";
    saveStoredRooms(rooms);

    if (rooms[roomIndex].postId) {
      const posts = getStoredPosts();
      const pIdx = posts.findIndex((p) => p.id === rooms[roomIndex].postId);
      if (pIdx >= 0) {
        posts[pIdx].status = "CLOSED";
        saveStoredPosts(posts);
      }
    }
  }

  const updatedRoom = await getChatRoomByPost(roomId);
  return updatedRoom;
}

export async function joinChatRoom(roomId: string): Promise<void> {
  const session = getSession();
  const userId = session?.user?.id || "u-current";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    await fetch(`${API_URL}/api/chat/${encodeURIComponent(roomId)}/join`, {
      method: "POST",
      headers: { ...getAuthHeaders() },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));
  } catch {
    // Offline: add user to room members in local storage
  }

  const rooms = getStoredRooms();
  const r = rooms.find((item) => item.id === roomId || `r-${item.postId}` === roomId);
  if (r && !r.members.includes(userId)) {
    r.members.push(userId);
    saveStoredRooms(rooms);
  }
}

export async function leaveChatRoom(roomId: string): Promise<void> {
  const session = getSession();
  const userId = session?.user?.id || "u-current";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    await fetch(`${API_URL}/api/chat/${encodeURIComponent(roomId)}/leave`, {
      method: "POST",
      headers: { ...getAuthHeaders() },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));
  } catch {
    // Offline
  }

  const rooms = getStoredRooms();
  const r = rooms.find((item) => item.id === roomId || `r-${item.postId}` === roomId);
  if (r) {
    r.members = r.members.filter((m) => m !== userId);
    saveStoredRooms(rooms);
  }
}

export async function makeNegotiationOffer(
  roomId: string,
  amount: number
): Promise<ResellOffer> {
  const session = getSession();
  const buyerId = session?.user?.id || "u-current";
  const buyerName = session?.user?.email?.split("@")[0] || "Interested Student";

  const newOffer: ResellOffer = {
    id: `off-${Date.now()}`,
    buyerId,
    buyerName,
    amount,
    status: "PENDING",
    timestamp: "Just now",
  };

  const rooms = getStoredRooms();
  const room = rooms.find((r) => r.id === roomId || `r-${r.postId}` === roomId);
  if (room) {
    room.offers = [...(room.offers || []), newOffer];
    saveStoredRooms(rooms);
  }

  // Also post an automated notification chat message in room
  await sendChatMessage(roomId, `Made an offer of ₹${amount.toLocaleString()} for this item.`);

  return newOffer;
}

export async function updateOfferStatus(
  roomId: string,
  offerId: string,
  newStatus: "ACCEPTED" | "DECLINED"
): Promise<void> {
  const rooms = getStoredRooms();
  const room = rooms.find((r) => r.id === roomId || `r-${r.postId}` === roomId);
  if (room && room.offers) {
    const offer = room.offers.find((o) => o.id === offerId);
    if (offer) {
      offer.status = newStatus;
      if (newStatus === "ACCEPTED") {
        room.resellStatus = "RESERVED";
      }
      saveStoredRooms(rooms);
    }
  }
}
