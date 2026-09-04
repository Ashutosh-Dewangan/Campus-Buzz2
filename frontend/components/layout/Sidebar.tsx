"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
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
  {
    label: "Official Space",
    href: "/official",
    icon: "⚑",
    img: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=500&q=60",
  },
  {
    label: "Clubs & Committees",
    href: "/official",
    icon: "★",
    img: "https://images.unsplash.com/photo-1461896836934-ffe607ba6851?auto=format&fit=crop&w=500&q=60",
  },
  {
    label: "Campus Calendar",
    href: "/official/calendar",
    icon: "▦",
    img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=500&q=60",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

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
        {navItems.map((item) => {
          const isActive =
            item.label === "Clubs & Committees"
              ? false
              : item.href === "/official"
                ? pathname === "/official"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className={`cb-panel${isActive ? " cb-panel--active" : ""}`}
              style={{ backgroundImage: `url("${item.img}")` }}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="cb-panel-icon" aria-hidden="true">{item.icon}</span>
              <span className="cb-panel-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="cb-profile-card">
        <div className="cb-id-card">
          <div className="cb-id-avatar">AD</div>
          <div>
            <div className="cb-id-name">Ashutosh D.</div>
            <div className="cb-id-role">Verified Student</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
