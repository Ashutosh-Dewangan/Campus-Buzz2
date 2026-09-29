"use client";

import { useCurrentUser as useSessionUser } from "@/lib/session";

export function useCurrentUser() {
  const user = useSessionUser();

  return {
    user,
    loading: false,
    isAuthenticated: user !== null,
  };
}