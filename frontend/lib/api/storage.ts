import {
  CampusUser,
  Complaint,
  Event,
  NotificationItem,
  OfficialPost,
  Post,
  ReportedPost,
  Room,
} from "@/types";
import {
  mockCampusUsers,
  mockComplaints,
  mockEvents,
  mockMessagesByRoom,
  mockNotifications,
  mockPosts,
  mockReportedPosts,
  mockRooms,
} from "@/data/mockData";

function getLocal<T>(key: string, defaultVal: T): T {
  if (typeof window === "undefined") return defaultVal;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultVal;
    return JSON.parse(raw) as T;
  } catch {
    return defaultVal;
  }
}

function setLocal<T>(key: string, val: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // Storage quota or private browsing safeguard
  }
}

// Posts
export function getStoredPosts(): Post[] {
  return getLocal<Post[]>("cb_posts", mockPosts);
}
export function saveStoredPosts(posts: Post[]): void {
  setLocal("cb_posts", posts);
}

// Events
export function getStoredEvents(): Event[] {
  return getLocal<Event[]>("cb_events", mockEvents);
}
export function saveStoredEvents(events: Event[]): void {
  setLocal("cb_events", events);
}

// Complaints
export function getStoredComplaints(): Complaint[] {
  return getLocal<Complaint[]>("cb_complaints", mockComplaints);
}
export function saveStoredComplaints(complaints: Complaint[]): void {
  setLocal("cb_complaints", complaints);
}

// Official Posts
export function getStoredOfficialPosts(): OfficialPost[] {
  return getLocal<OfficialPost[]>("cb_official", mockOfficialPosts);
}
export function saveStoredOfficialPosts(posts: OfficialPost[]): void {
  setLocal("cb_official", posts);
}

// Rooms
export function getStoredRooms(): Room[] {
  return getLocal<Room[]>("cb_rooms", mockRooms);
}
export function saveStoredRooms(rooms: Room[]): void {
  setLocal("cb_rooms", rooms);
}

// Messages
export function getStoredMessages(): Record<
  string,
  Array<{
    id: string;
    chatRoomId: string;
    userId: string;
    content: string;
    createdAt: string;
    user: { id: string; name: string };
  }>
> {
  return getLocal("cb_room_messages", mockMessagesByRoom);
}
export function saveStoredMessages(
  messages: Record<
    string,
    Array<{
      id: string;
      chatRoomId: string;
      userId: string;
      content: string;
      createdAt: string;
      user: { id: string; name: string };
    }>
  >
): void {
  setLocal("cb_room_messages", messages);
}

// Notifications
export function getStoredNotifications(): NotificationItem[] {
  return getLocal<NotificationItem[]>("cb_notifications", mockNotifications);
}
export function saveStoredNotifications(items: NotificationItem[]): void {
  setLocal("cb_notifications", items);
}

// Reported Posts (Admin)
export function getStoredReports(): ReportedPost[] {
  return getLocal<ReportedPost[]>("cb_reports", mockReportedPosts);
}
export function saveStoredReports(reports: ReportedPost[]): void {
  setLocal("cb_reports", reports);
}

// Campus Users (Admin)
export function getStoredUsers(): CampusUser[] {
  return getLocal<CampusUser[]>("cb_users", mockCampusUsers);
}
export function saveStoredUsers(users: CampusUser[]): void {
  setLocal("cb_users", users);
}
