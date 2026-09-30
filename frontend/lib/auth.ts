import { UserRole } from "@/types";
import { OrganizationMembership } from "@/lib/session";

export function canCreateOfficialPost(
  role: UserRole,
  memberships: OrganizationMembership[] = [],
) {
  if (role === "ADMIN") return true;

  return memberships.some(
    (membership) => membership.status === "ACTIVE",
  );
}

export function canCreateEvent(
  role: UserRole,
  memberships: OrganizationMembership[] = [],
) {
  if (role === "ADMIN") return true;

  return memberships.some(
    (membership) => membership.status === "ACTIVE",
  );
}

export function isAdmin(role: UserRole) {
  return role === "ADMIN";
}