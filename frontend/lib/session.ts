import { useSyncExternalStore } from "react";
import { UserRole } from "@/types";

export interface OrganizationMembership {
  id: string;
  status: "ACTIVE" | "INACTIVE";
  organization: {
    id: string;
    name: string;
    type: "CLUB" | "COMMITTEE";
  };
}

export interface CurrentUser {
  id: string;
  rollNumber: string;
  email: string;
  role: UserRole;
  name?: string;
  memberships?: OrganizationMembership[];
}

export interface Session {
  token: string;
  user: CurrentUser;
}

export const DEMO_PERSONAS: Record<UserRole, CurrentUser> = {
  STUDENT: {
    id: "u1",
    rollNumber: "23CS1004",
    name: "Alex Rivera",
    email: "alex.rivera@campusbuzz.test",
    role: "STUDENT",
    memberships: [],
  },
  CLUB: {
    id: "u-club",
    rollNumber: "22CS0012",
    name: "Coding Club Lead",
    email: "codingclub@campusbuzz.test",
    role: "CLUB",
    memberships: [
      {
        id: "m-club-demo",
        status: "ACTIVE",
        organization: {
          id: "00000000-0000-0000-0000-000000000001",
          name: "Robotics Club",
          type: "CLUB",
        },
      },
    ],
  },
  COMMITTEE: {
    id: "u-comm",
    rollNumber: "22AR0045",
    name: "Cultural Society Secretary",
    email: "cultural@campusbuzz.test",
    role: "COMMITTEE",
    memberships: [
      {
        id: "m-comm-demo",
        status: "ACTIVE",
        organization: {
          id: "00000000-0000-0000-0000-000000000002",
          name: "Cultural Committee",
          type: "COMMITTEE",
        },
      },
    ],
  },
  ADMIN: {
    id: "u-admin",
    rollNumber: "ADMIN01",
    name: "Campus Administrator",
    email: "admin@campusbuzz.test",
    role: "ADMIN",
    memberships: [],
  },
};


const SESSION_KEY = "campus_buzz_session";
const SESSION_EVENT = "campus_buzz_session_change";

export function getSession(): Session | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedSession = localStorage.getItem(SESSION_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession) as Session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function getCurrentUser(): CurrentUser | null {
  return getSession()?.user ?? null;
}

export function setCurrentUser(user: CurrentUser, token: string) {
  setSession({ token, user });
}

export function switchDemoPersona(role: UserRole) {
  const persona = DEMO_PERSONAS[role];
  if (persona) {
    setCurrentUser(persona, `mock-demo-token-${role.toLowerCase()}`);
  }
}

export function setSession(session: Session) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(SESSION_EVENT));
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(SESSION_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SESSION_EVENT, callback);
  };
}

let cachedSessionString: string | null = null;
let cachedCurrentUser: CurrentUser | null = null;

function getSnapshot(): CurrentUser | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(SESSION_KEY);
  if (stored !== cachedSessionString) {
    cachedSessionString = stored;
    try {
      cachedCurrentUser = stored ? (JSON.parse(stored) as Session).user : null;
    } catch {
      cachedCurrentUser = null;
    }
  }
  return cachedCurrentUser;
}

function getServerSnapshot(): CurrentUser | null {
  return null;
}

export function useCurrentUser(): CurrentUser | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}