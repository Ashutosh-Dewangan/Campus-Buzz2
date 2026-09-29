"use client";

import { useState, useRef, useEffect } from "react";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import { useCurrentUser, switchDemoPersona } from "@/lib/session";
import { UserRole } from "@/types";

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
    if (personaOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
        <div className="cb-search-bar">
          <input
            type="search"
            placeholder="Search campus..."
            aria-label="Search campus"
          />
          <span aria-hidden="true">⌕</span>
        </div>

        {/* Development Persona Switcher (Demo Feature) */}
        <div className="relative" ref={personaRef}>
          <button
            type="button"
            onClick={() => setPersonaOpen((prev) => !prev)}
            title="Development Persona Switcher"
            className="flex items-center gap-2 rounded-sm border-2 border-black bg-[rgba(14,10,32,0.95)] px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-[var(--neon-yellow)] shadow-[2px_2px_0_#000] hover:border-white/60 transition cursor-pointer"
          >
            <span className="text-[9px] text-[var(--fg-muted)]">ROLE:</span>
            <span>
              {user ? user.role : "STUDENT"}
            </span>
            <span className="text-[9px] text-white/70">▾</span>
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
                      {isActive && <span className="text-[10px] font-black">✓</span>}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 border-t border-black/40 pt-2 px-0.5 text-[10px] text-[var(--fg-muted)] leading-tight">
                Preview mode · Server RBAC is authoritative
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <NotificationDropdown />
      </div>
    </header>
  );
}
