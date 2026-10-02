"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser, CurrentUser, clearSession } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import {
  MegaphoneIcon,
  CalendarIcon,
  UsersIcon,
  AlertCircleIcon,
  PinIcon,
  ShieldIcon,
} from "@/components/ui/Icons";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  img: string;
}

const primaryNav: NavItem[] = [
  {
    label: "Campus Buzz",
    href: "/buzz",
    icon: <MegaphoneIcon className="h-3.5 w-3.5 text-white" />,
    img: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=500&q=60",
  },
  {
    label: "Events",
    href: "/events",
    icon: <CalendarIcon className="h-3.5 w-3.5 text-white" />,
    img: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=500&q=60",
  },
  {
    label: "Rooms",
    href: "/rooms",
    icon: <UsersIcon className="h-3.5 w-3.5 text-white" />,
    img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=500&q=60",
  },
  {
    label: "Complaints",
    href: "/complaints",
    icon: <AlertCircleIcon className="h-3.5 w-3.5 text-white" />,
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=500&q=60",
  },
];

const secondaryNavBase: NavItem[] = [
  {
    label: "Official Campus",
    href: "/official",
    icon: <PinIcon className="h-3.5 w-3.5 text-white" />,
    img: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=500&q=60",
  },
  {
    label: "Campus Calendar",
    href: "/official/calendar",
    icon: <CalendarIcon className="h-3.5 w-3.5 text-white" />,
    img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=500&q=60",
  },
];

function NavPanel({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={`cb-panel${isActive ? " cb-panel--active" : ""}`}
      style={{ backgroundImage: `url("${item.img}")` }}
      aria-current={isActive ? "page" : undefined}
    >
      <span className="cb-panel-icon" aria-hidden="true">{item.icon}</span>
      <span className="cb-panel-label">{item.label}</span>
    </Link>
  );
}

function getUserInitials(user: CurrentUser): string {
  if (!user.email) return "?";
  const name = user.email.split("@")[0];
  return name.slice(0, 2).toUpperCase();
}

function getRoleLabel(user: CurrentUser): string {
  switch (user.role) {
    case "ADMIN": return "Administrator";
    case "CLUB": return "Club / Society";
    case "COMMITTEE": return "Committee";
    case "STUDENT": return "Verified Student";
    default: return "Student";
  }
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useCurrentUser();
  const isUserAdmin = user ? isAdmin(user.role) : false;

  const secondaryNav: NavItem[] = isUserAdmin
    ? [
        ...secondaryNavBase,
        {
          label: "Admin Dashboard",
          href: "/admin",
          icon: <ShieldIcon className="h-3.5 w-3.5 text-white" />,
          img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=500&q=60",
        },
      ]
    : secondaryNavBase;

  return (
    <aside className="cb-sidebar">
      <div className="cb-sidebar-logo">
        <Link href="/" style={{ textDecoration: "none" }}>
          <div className="cb-sidebar-logo-text">
            CAMPUS
            <em>BUZZ</em>
          </div>
        </Link>
      </div>

      <nav className="cb-sidebar-nav">
        {primaryNav.map((item) => {
          const isActive =
            item.href === "/buzz"
              ? pathname === "/buzz" || pathname.startsWith("/buzz/")
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return <NavPanel key={item.href} item={item} isActive={isActive} />;
        })}

        {/* Divider */}
        <div
          style={{
            margin: "4px 0",
            height: 1,
            background: "rgba(255,255,255,0.08)",
            border: "none",
          }}
        />

        {secondaryNav.map((item) => {
          const isActive =
            item.href === "/official"
              ? pathname === "/official"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return <NavPanel key={item.href} item={item} isActive={isActive} />;
        })}
      </nav>

      {/* Account / Pass Section */}
      <div className="cb-profile-card">
        <div className="cb-id-card">
          <div className="flex items-center gap-2.5">
            <div className="cb-id-avatar">
              {user ? getUserInitials(user) : "?"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[9px] font-black uppercase tracking-widest text-[var(--fg-muted)] leading-none mb-0.5">
                {user ? "PASS ID" : "CAMPUS PASS"}
              </div>
              <div className="cb-id-name truncate">
                {user ? user.email.split("@")[0] : "Guest"}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-black/40">
            <div className="flex items-center gap-1 min-w-0 truncate">
              <span className="cb-id-role truncate">
                {user ? getRoleLabel(user) : "Not signed in"}
              </span>
              {user?.role === "ADMIN" && (
                <span className="tag-pill tag-food text-[8px] px-1 py-0 leading-tight">Admin</span>
              )}
              {user?.role === "STUDENT" && (
                <span className="tag-pill tag-found text-[8px] px-1 py-0 leading-tight">Verified</span>
              )}
            </div>
            {user ? (
              <button
                type="button"
                onClick={() => {
                clearSession();
                router.replace("/login");
                }}              
                className="text-[10px] font-bold text-[var(--fg-muted)] hover:text-[var(--accent)] underline shrink-0 cursor-pointer transition"
                title="Sign out of your session"
              >
                Sign out
              </button>
            ) : (
              <Link href="/login" className="text-[10px] font-bold text-[var(--neon-cyan)] hover:underline shrink-0 transition">
                Sign in ↗
              </Link>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
