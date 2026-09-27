import { useSyncExternalStore } from "react";
import { UserRole } from "@/types";

export interface CurrentUser {
  id: string;
  rollNumber: string;
  email: string;
  role: UserRole;
}

export interface Session {
  token: string;
  user: CurrentUser;
}

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
export function setCurrentUser(
  user: CurrentUser,
  token: string
) {
  setSession({ token, user });
}

export function setSession(session: Session) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(session)
  );
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