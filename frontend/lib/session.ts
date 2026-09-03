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

export function setCurrentUser(user: CurrentUser, token: string = "session-token") {
  setSession({ token, user });
}

export function setSession(session: Session) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(session)
  );
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}