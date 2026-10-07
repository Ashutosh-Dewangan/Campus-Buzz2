"use client";

import { useState, useRef, useEffect } from "react";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import AccountDropdown from "@/components/layout/AccountDropdown";
import { useCurrentUser, switchDemoPersona } from "@/lib/session";
import { UserRole } from "@/types";
import { SearchIcon, ChevronDownIcon, CheckIcon } from "@/components/ui/Icons";

export default function Navbar() {
  const user = useCurrentUser();
  const [personaOpen, setPersonaOpen] = useState(false);
  const personaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        personaRef.current &&
        !personaRef.current.contains(event.target as Node)
      ) {
        setPersonaOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPersonaOpen(false);
      }
    }

    if (personaOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [personaOpen]);

  const roles: Array<{ role: UserRole; label: string; badge: string }> = [
    { role: "STUDENT", label: "Student (Alex Rivera)", badge: "STUDENT" },
    { role: "CLUB", label: "Coding Club Lead", badge: "CLUB" },
    { role: "COMMITTEE", label: "Cultural Committee", badge: "COMM" },
    { role: "ADMIN", label: "Campus Administrator", badge: "ADMIN" },
  ];

  return (
    <header className="cb-navbar" aria-label="Campus navigation">
      <div className="cb-navbar-tagline hidden sm:block">
        What&apos;s happening on campus?
      </div>

      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="cb-search-bar hidden md:flex">
          <input
            type="search"
            placeholder="Search campus..."
            aria-label="Search campus"
          />
          <SearchIcon className="h-3.5 w-3.5 text-black/70 shrink-0" />
        </div>

        {/* Development Persona Switcher (Demo Feature) */}
        <div className="relative" ref={personaRef}>
          <button
            type="button"
            onClick={() => setPersonaOpen((prev) => !prev)}
            title="Development Persona Switcher"
            className="flex items-center gap-1.5 rounded-sm border-2 border-black bg-[rgba(14,10,32,0.95)] px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-[var(--neon-yellow)] shadow-[2px_2px_0_#000] hover:border-white/60 transition cursor-pointer"
          >
            <span className="text-[9px] text-[var(--fg-muted)]">ROLE:</span>
            <span>
              {user ? user.role : "STUDENT"}
            </span>
            <ChevronDownIcon className="h-3 w-3 text-white/70 shrink-0" />
          </button>

          {personaOpen && (
            <div className="comic-modal absolute right-0 top-10 z-50 w-64 rounded-sm p-3.5 shadow-[5px_5px_0_#000] text-left">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-white">
                  Demo Persona Switcher
                </span>
                <span className="tag-pill tag-lost text-[8px] px-1 py-0 leading-tight">Preview</span>
              </div>
              <div className="space-y-1">
                {roles.map((r) => {
                  const isActive = user?.role === r.role;
                  return (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => {
                        switchDemoPersona(r.role);
                        setPersonaOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-2.5 py-2 text-xs font-bold rounded-sm transition cursor-pointer ${
                        isActive
                          ? "bg-[var(--accent)] text-white shadow-[1px_1px_0_#000]"
                          : "text-[var(--fg)] hover:bg-white/10"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="rounded-sm border border-black/50 bg-black/40 px-1 py-0.2 text-[8px] font-black tracking-wider text-[var(--neon-cyan)]">
                          {r.badge}
                        </span>
                        <span>{r.label}</span>
                      </span>
                      {isActive && <CheckIcon className="h-3.5 w-3.5 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 border-t border-black/40 pt-2 px-0.5 text-[9px] text-[var(--fg-muted)] leading-tight space-y-1 font-readable">
                <p className="font-bold text-[var(--neon-yellow)]">Demo Persona Switcher (Client-only)</p>
                <p>Simulates role interfaces for local testing. Backend authorization is authoritative and cannot be bypassed.</p>
              </div>
            </div>

          )}
        </div>

        {/* Notifications Dropdown */}
        <NotificationDropdown />

        {/* Account / Profile Dropdown */}
        <AccountDropdown />
      </div>
    </header>
  );
}
