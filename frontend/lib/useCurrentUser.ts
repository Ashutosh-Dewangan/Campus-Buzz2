// ============================================================
// REPLACED PART
// frontend/lib/useCurrentUser.ts
//
// Reads the current session without synchronously calling
// setState inside an effect.
// ============================================================

"use client";

import { useState } from "react";

import {
  getCurrentUser,
  type CurrentUser,
} from "@/lib/session";

// Read the session lazily during initial state creation.
// This avoids the React 19 set-state-in-effect warning.
export function useCurrentUser() {
  const [user] = useState<CurrentUser | null>(
    () => getCurrentUser()
  );

  return {
    user,
    loading: false,
    isAuthenticated: user !== null,
  };
}