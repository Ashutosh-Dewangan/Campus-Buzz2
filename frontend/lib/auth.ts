import { UserRole } from "@/types";
import { OrganizationMembership } from "@/lib/session";

export function isStudent(role?: UserRole): boolean {
  return role === "STUDENT";
}

export function isClubOrCommittee(role?: UserRole): boolean {
  return role === "CLUB" || role === "COMMITTEE";
}

export function isAdmin(role?: UserRole): boolean {
  return role === "ADMIN";
}

/**
 * According to backend post.routes.ts:
 * router.post("/", authenticate, requireRole("STUDENT"), ...)
 * Only STUDENT accounts can create Campus Buzz posts.
 */
export function canCreateBuzzPost(role?: UserRole): boolean {
  return role === "STUDENT";
}

/**
 * Official post creation:
 * Admin can create for any org.
 * Club / Committee roles can create.
 * Students can create if they have an active membership in an organization.
 */
export function canCreateOfficialPost(
  role?: UserRole,
  memberships: OrganizationMembership[] = [],
): boolean {
  if (role === "ADMIN") return true;

  return memberships.some(
    (membership) => membership.status === "ACTIVE",
  );
}

/**
 * Event creation:
 * Admin can create events.
 * Club / Committee roles can create events.
 * Students can create events if they have an active membership in an organization.
 */
export function canCreateEvent(
  role?: UserRole,
  memberships: OrganizationMembership[] = [],
): boolean {
  if (role === "ADMIN") return true;

  return memberships.some(
    (membership) => membership.status === "ACTIVE",
  );
}

export function canAccessAdmin(role?: UserRole): boolean {
  return role === "ADMIN";
}