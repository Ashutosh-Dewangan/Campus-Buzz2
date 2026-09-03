"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    name: "Campus Buzz",
    href: "/buzz",
    icon: "🏫",
  },
  {
    name: "Active Rooms",
    href: "/rooms",
    icon: "💬",
  },
  {
    name: "Events",
    href: "/events",
    icon: "📅",
  },
  {
    name: "Complaints",
    href: "/complaints",
    icon: "📢",
  },
  {
    name: "Official",
    href: "/official",
    icon: "📋",
  },
  {
    name: "Admin",
    href: "/admin",
    icon: "⚙️",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:block">
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col">
        {/* Brand */}
        <div className="border-b border-gray-100 px-6 py-6">
          <Link href="/buzz" className="group block">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-950 text-sm font-bold text-white shadow-sm transition-transform group-hover:scale-105">
                CB
              </div>

              <div>
                <h1 className="text-[15px] font-bold tracking-tight text-gray-950">
                  Campus Buzz
                </h1>

                <p className="mt-0.5 text-[11px] text-gray-400">
                  Your campus. Connected.
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
            Campus
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gray-950 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-950"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm ${
                      isActive
                        ? "bg-white/10"
                        : "bg-gray-50 group-hover:bg-white"
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4">
          <div className="rounded-xl border border-orange-100 bg-orange-50/70 p-3.5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-xs shadow-sm">
                ✦
              </span>

              <p className="text-xs font-semibold text-gray-800">
                Campus Buzz
              </p>
            </div>

            <p className="mt-2 text-[11px] leading-5 text-gray-500">
              Coordinate. Discover. Connect.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}