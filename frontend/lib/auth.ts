import { UserRole } from "@/types";

export function canCreateOfficialPost(
  role: UserRole
) {
  return (
    role === "CLUB" ||
    role === "COMMITTEE" ||
    role === "ADMIN"
  );
}

export function canCreateEvent(
  role: UserRole
) {
  return (
    role === "CLUB" ||
    role === "COMMITTEE" ||
    role === "ADMIN"
  );
}

export function isAdmin(role: UserRole) {
  return role === "ADMIN";
}