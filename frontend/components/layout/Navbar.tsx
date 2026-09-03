"use client";

import Link from "next/link";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Mobile brand */}
        <Link
          href="/buzz"
          className="group flex items-center gap-2.5 lg:hidden"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-950 text-[10px] font-bold text-white">
            CB
          </div>

          <div>
            <h1 className="text-sm font-bold tracking-tight text-gray-950">
              Campus Buzz
            </h1>

            <p className="hidden text-[10px] text-gray-400 sm:block">
              Your campus. Connected.
            </p>
          </div>
        </Link>

        {/* Desktop spacer */}
        <div className="hidden lg:block" />

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          <NotificationDropdown />

          <div className="hidden h-7 w-px bg-gray-200 sm:block" />

          <button
            type="button"
            className="group flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-gray-100"
            aria-label="Open profile"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-950 text-xs font-bold text-white shadow-sm">
              Y
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-gray-900">
                You
              </p>

              <p className="text-[10px] text-gray-400">
                Student
              </p>
            </div>

            <span className="hidden text-[10px] text-gray-400 sm:block">
              ▾
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}