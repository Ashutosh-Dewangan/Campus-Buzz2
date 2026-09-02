export type UserRole =
  | "STUDENT"
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
    contactName?: string;
    contactPhone?: string;
    createdAt: string;
    expiresAt?: string;
    status: "ACTIVE" | "CLOSED";
  }

export interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  createdBy?: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: "OPEN" | "RESOLVED";
  userId?: string;
}

export interface OfficialPost {
  id: string;
  organization: string;
  content: string;
  link?: string;
  formUrl?: string;
  eventName?: string;
  createdAt?: string;
}

export interface Message {
  id: string;
  user: string;
  message: string;
  timestamp?: string;
}

export interface Room {
  id: string;
  postId?: string;
  name: string;
  creatorId?: string;
  status: "OPEN" | "CLOSED";
  members: string[];
}