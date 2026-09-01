"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { label: "Buzz", href: "/buzz", icon: "🐝" },
  { label: "Rooms", href: "/rooms", icon: "💬" },
  { label: "Events", href: "/events", icon: "📅" },
  { label: "Complaints", href: "/complaints", icon: "📢" },
  { label: "Official", href: "/official", icon: "🏛️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 border-r bg-white md:block">
      <nav className="flex flex-col gap-1 p-4">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}