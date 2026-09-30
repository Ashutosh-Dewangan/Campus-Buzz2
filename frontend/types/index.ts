export type UserRole =
  | "STUDENT"
  | "CLUB"
  | "COMMITTEE"
  | "ADMIN";

export type Hashtag =
  | "#foodsplit"
  | "#cabsplit"
  | "#resell"
  | "#lost"
  | "#found";

export interface Post {
  id: string;
  image: string;
  title: string;
  description: string;
  hashtags: string[];
  interactionType:
    | "FOOD_SPLIT"
    | "CAB_SPLIT"
    | "RESELL"
    | "LOST"
    | "FOUND";
  author: string;
  authorId?: string;
  contactName?: string;
  contactPhone?: string;
  createdAt: string;
  expiresAt?: string;
  status: "ACTIVE" | "CLOSED";
  // Coordination metadata
  price?: string;
  itemCondition?: string;
  departureTime?: string;
  pickupLocation?: string;
  seatsTotal?: number;
  seatsFilled?: number;
  orderTotal?: number;
  splitCount?: number;
  resellStatus?: "AVAILABLE" | "RESERVED" | "SOLD";
}

export interface EventOrganization {
  id: string;
  name: string;
  type: "CLUB" | "COMMITTEE";
}
export interface Event {
id: string;
name: string;
date: string;
time: string;
venue: string;
description: string;
// Organization responsible for the event.
organizationId?: string | null;
organization?: EventOrganization | null;
// Actual authenticated user who created the event.
createdBy?: string;
createdById?: string;
// Official-post relationship.
linkedOfficialPostId?: string | null;
createdAt?: string;
updatedAt?: string;
}

export type ComplaintCategory =
  | "Hostel"
  | "Mess / Cafeteria"
  | "Campus Wi-Fi"
  | "Library / Facilities"
  | "Academic"
  | "Other";

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category?: ComplaintCategory;
  createdAt: string;
  status: "OPEN" | "RESOLVED";
  resolved?: boolean;
  userId?: string;
  studentRoll?: string; // Visible only in Admin mock view
}

export interface OfficialPost {
  id: string;
  title: string;
  content: string;
  link?: string | null;
  formUrl?: string | null;

  authorId: string;
  author?: {
    id: string;
    name: string;
  } | null;

  organizationId: string;
  organization: {
    id: string;
    name: string;
    type: "CLUB" | "COMMITTEE";
  };

  event?: {
    id: string;
    name: string;
    date: string;
    time: string;
    venue: string;
  } | null;

  createdAt?: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  user: string;
  message: string;
  timestamp?: string;
  userId?: string;
}

export interface RoomParticipant {
  id: string;
  name: string;
  role: string;
  isOnline: boolean;
  isCreator?: boolean;
}

export interface ResellOffer {
  id: string;
  buyerName: string;
  buyerId: string;
  amount: number;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  timestamp: string;
}

export interface Room {
  id: string;
  postId?: string;
  name: string;
  creatorId?: string;
  creatorName?: string;
  status: "OPEN" | "CLOSED";
  members: string[];
  participants?: RoomParticipant[];
  interactionType?: Post["interactionType"];
  offers?: ResellOffer[];
  resellStatus?: "AVAILABLE" | "RESERVED" | "SOLD";
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type?: "room_message" | "participant_joined" | "expiry_approaching" | "event_alert" | "complaint_resolved";
  link?: string;
}

export interface ReportedPost {
  id: string;
  postId: string;
  postTitle: string;
  reportedBy: string;
  reason: string;
  createdAt: string;
  status: "PENDING" | "DISMISSED" | "RESOLVED";
}

export interface CampusUser {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  role: UserRole;
  status: "ACTIVE" | "SUSPENDED";
  joinedDate: string;
}