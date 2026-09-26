"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser, CurrentUser } from "@/lib/session";

const primaryNav = [
  {
    label: "Campus Buzz",
    href: "/buzz",
    icon: "📣",
    img: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=500&q=60",
  },
  {
    label: "Events",
    href: "/events",
    icon: "✦",
    img: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=500&q=60",
  },
  {
    label: "Rooms",
    href: "/rooms",
    icon: "👥",
    img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=500&q=60",
  },
  {
    label: "Complaints",
    href: "/complaints",
    icon: "▣",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=500&q=60",
  },
];

const secondaryNav = [
  {
    label: "Official Campus",
    href: "/official",
    icon: "⚑",
    img: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=500&q=60",
  },
  {
    label: "Campus Calendar",
    href: "/official/calendar",
    icon: "▦",
    img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=500&q=60",
  },
];

function NavPanel({ item, isActive }: { item: { label: string; href: string; icon: string; img: string }; isActive: boolean }) {
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
  const user = useCurrentUser();

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

      <div className="cb-profile-card">
        <div className="cb-id-card">
          <div className="cb-id-avatar">
            {user ? getUserInitials(user) : "?"}
          </div>
          <div>
            <div className="cb-id-name">
              {user ? user.email.split("@")[0] : "Guest"}
            </div>
            <div className="cb-id-role">
              {user ? getRoleLabel(user) : "Not signed in"}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
