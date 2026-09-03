import { UserRole } from "@/types";

export function canCreateOfficialPost(role: UserRole) {
  return role === "ADMIN" || role === "CLUB" || role === "COMMITTEE";
}

export function canCreateEvent(role: UserRole) {
  return role === "ADMIN" || role === "CLUB" || role === "COMMITTEE";
}

export function isAdmin(role: UserRole) {
  return role === "ADMIN";
}