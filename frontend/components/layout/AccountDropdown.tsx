"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrentUser, clearSession } from "@/lib/session";
import {
  UserIcon,
  LogOutIcon,
  ShieldIcon,
  UsersIcon,
  MegaphoneIcon,
  AlertCircleIcon,
  PinIcon,
  ChevronDownIcon,
} from "@/components/ui/Icons";

function getUserInitials(nameOrEmail?: string): string {
  if (!nameOrEmail) return "CB";
  const part = nameOrEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
  return part.slice(0, 2).toUpperCase() || "CB";
}

function getRoleBadge(role?: string) {
  switch (role) {
    case "ADMIN":
      return { label: "Admin", style: "tag-pill tag-food" };
    case "CLUB":
      return { label: "Club Lead", style: "tag-pill tag-cab" };
    case "COMMITTEE":
      return { label: "Committee", style: "tag-pill tag-lost" };
    case "STUDENT":
    default:
      return { label: "Student", style: "tag-pill tag-found" };
  }
}

export default function AccountDropdown() {
  const user = useCurrentUser();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const initials = getUserInitials(user?.email);
  const badge = getRoleBadge(user?.role);

  if (!user) {
    return (
      <Link
        href="/login"
        className="retro-btn text-xs font-bold px-3 py-1.5 whitespace-nowrap"
      >
        Sign in ↗
      </Link>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="User account menu"
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 rounded-sm border-2 border-black bg-[rgba(16,10,36,0.95)] p-1 pr-2 shadow-[2px_2px_0_#000] hover:border-white/60 transition cursor-pointer"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-black bg-[var(--accent)] text-xs font-black text-white shadow-[0_0_8px_rgba(255,45,74,0.45)]">
          {initials}
        </div>
        <span className="hidden md:inline-block max-w-[80px] truncate text-xs font-bold text-white">
          {user.email.split("@")[0]}
        </span>
        <ChevronDownIcon className="h-3 w-3 text-white/70" />
      </button>

      {/* Account Dropdown Panel */}
      {isOpen && (
        <div className="comic-modal absolute right-0 top-11 z-50 w-72 sm:w-80 max-w-[calc(100vw-24px)] rounded-sm p-0 shadow-[6px_6px_0_#000] overflow-hidden text-left">
          {/* Header Identity Card */}
          <div className="border-b-2 border-black bg-[rgba(18,12,38,0.98)] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-black bg-[var(--accent)] text-sm font-black text-white shadow-[0_0_10px_rgba(255,45,74,0.5)]">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="truncate text-sm font-extrabold text-white">
                    {user.email.split("@")[0]}
                  </h3>
                  <span className={`${badge.style} text-[9px] px-1.5 py-0 shrink-0 leading-tight`}>
                    {badge.label}
                  </span>
                </div>

                <p className="mt-0.5 truncate text-xs text-[var(--fg-muted)] font-readable">
                  {user.email}
                </p>

                {user.rollNumber && (
                  <p className="mt-1 inline-block rounded-sm border border-black/60 bg-black/40 px-1.5 py-0.5 text-[10px] font-bold text-[var(--neon-cyan)] tracking-wider">
                    ROLL: {user.rollNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="p-2 space-y-1 bg-[rgba(12,8,26,0.95)]">
            <Link
              href="/buzz"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-bold text-[var(--fg)] hover:bg-white/10 hover:text-white transition"
            >
              <MegaphoneIcon className="h-4 w-4 text-[var(--accent)] shrink-0" />
              <span>Campus Buzz Feed</span>
            </Link>

            <Link
              href="/rooms"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-bold text-[var(--fg)] hover:bg-white/10 hover:text-white transition"
            >
              <UsersIcon className="h-4 w-4 text-[var(--neon-cyan)] shrink-0" />
              <span>Coordination Rooms</span>
            </Link>

            <Link
              href="/complaints"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-bold text-[var(--fg)] hover:bg-white/10 hover:text-white transition"
            >
              <AlertCircleIcon className="h-4 w-4 text-[var(--neon-yellow)] shrink-0" />
              <span>Campus Complaints</span>
            </Link>

            <Link
              href="/official"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-bold text-[var(--fg)] hover:bg-white/10 hover:text-white transition"
            >
              <PinIcon className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Official Notices</span>
            </Link>

            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-bold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition border border-[var(--accent)]/40"
              >
                <ShieldIcon className="h-4 w-4 shrink-0" />
                <span>Admin Moderation</span>
              </Link>
            )}
          </div>

          {/* Action / Logout Footer */}
          <div className="border-t-2 border-black bg-[rgba(10,8,22,0.98)] p-2.5 px-3 flex items-center justify-between">
            <span className="text-[10px] text-[var(--fg-muted)] flex items-center gap-1 font-readable">
              <UserIcon className="h-3 w-3 text-emerald-400" />
              <span>Verified Session</span>
            </span>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                clearSession();
                router.replace("/login");
              }}
              className="flex items-center gap-1.5 rounded-sm border border-black/60 bg-black/40 px-2.5 py-1 text-xs font-bold text-[var(--fg-muted)] hover:bg-red-950/80 hover:text-[var(--accent)] hover:border-red-900 transition cursor-pointer"
            >
              <LogOutIcon className="h-3.5 w-3.5 shrink-0" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
