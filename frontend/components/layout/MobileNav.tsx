"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const mobileNav = [
  { label: "Buzz",       href: "/buzz",       icon: "📣" },
  { label: "Events",     href: "/events",     icon: "✦"  },
  { label: "Rooms",      href: "/rooms",      icon: "👥" },
  { label: "Complaints", href: "/complaints", icon: "▣"  },
  { label: "Official",   href: "/official",   icon: "⚑"  },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="cb-mobile-nav" aria-label="Mobile navigation">
      {mobileNav.map((item) => {
        const isActive =
          item.href === "/buzz"
            ? pathname === "/buzz" || pathname.startsWith("/buzz/")
            : item.href === "/official"
            ? pathname === "/official" || pathname.startsWith("/official/")
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`cb-mobile-nav-item${isActive ? " cb-mobile-nav-item--active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="cb-mobile-nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="cb-mobile-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
