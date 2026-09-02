import { UserRole } from "@/types";

export interface CurrentUser {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  role: UserRole;
}

const SESSION_KEY = "campus_buzz_user";

export function getCurrentUser(): CurrentUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedUser = localStorage.getItem(SESSION_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as CurrentUser;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function setCurrentUser(user: CurrentUser) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(user)
  );
}

export function clearCurrentUser() {
  localStorage.removeItem(SESSION_KEY);
}