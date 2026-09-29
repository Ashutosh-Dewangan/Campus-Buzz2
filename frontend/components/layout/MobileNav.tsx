"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertCircleIcon,
  CalendarIcon,
  MegaphoneIcon,
  PinIcon,
  UsersIcon,
} from "@/components/ui/Icons";

const mobileNav = [
  { label: "Buzz",       href: "/buzz",       Icon: MegaphoneIcon   },
  { label: "Events",     href: "/events",     Icon: CalendarIcon    },
  { label: "Rooms",      href: "/rooms",      Icon: UsersIcon       },
  { label: "Complaints", href: "/complaints", Icon: AlertCircleIcon },
  { label: "Official",   href: "/official",   Icon: PinIcon         },
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
            <span className="cb-mobile-nav-icon flex items-center justify-center" aria-hidden="true">
              <item.Icon className="h-5 w-5" />
            </span>
            <span className="cb-mobile-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
