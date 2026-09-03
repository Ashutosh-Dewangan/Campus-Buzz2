"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeSelector from "./ThemeSelector";

const navItems = [
  { label: "Campus Buzz", href: "/buzz", icon: "🏫", badge: "C1" },
  { label: "Events",      href: "/events",      icon: "📅" },
  { label: "Rooms",       href: "/rooms",       icon: "🚪" },
  { label: "Complaints",  href: "/complaints",  icon: "🔔" },
];

const officialItems = [
  { label: "Clubs & Committees", href: "/official" },
  { label: "Campus Calendar",    href: "/official/calendar" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="cb-sidebar">
      {/* Logo block */}
      <div className="cb-sidebar-logo">
        <Link href="/buzz" style={{ textDecoration: "none" }}>
          <div className="cb-sidebar-logo-text">CAMPUS<br />BUZZ</div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="cb-sidebar-nav">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`cb-sidebar-item${isActive ? " cb-sidebar-item--active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              {item.badge && (
                <span className="cb-sidebar-badge">{item.badge}</span>
              )}
              <span className="cb-sidebar-item-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Official Space section */}
        <div className="cb-sidebar-section-label">Ovicial Space</div>
        {officialItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="cb-sidebar-item"
          >
            <span style={{ fontSize: 11, color: "var(--fg-muted)" }}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      {/* Theme Selector */}
      <ThemeSelector />

      {/* Profile card */}
      <div className="cb-profile-card">
        <div className="cb-id-card">
          <div className="cb-id-photo-placeholder">👤</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div className="cb-id-avatar">AD</div>
            <div>
              <div className="cb-id-name">Ashutosh D.</div>
              <div className="cb-id-role">Verified Student</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}