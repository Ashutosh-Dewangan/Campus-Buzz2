import Link from "next/link";

const navigationItems = [
  { label: "Buzz", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Complaints", href: "/complaints" },
  { label: "Official", href: "/official" },
  { label: "Rooms", href: "/rooms" },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-60 border-r bg-white md:block">
      <nav className="flex flex-col gap-1 p-4">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg px-4 py-3 text-sm font-medium hover:bg-slate-100"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}