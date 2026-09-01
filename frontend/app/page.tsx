import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Welcome to <span className="text-black underline decoration-blue-500">Campus Buzz</span>
        </h1>
        <p className="text-lg text-gray-600">
          The all-in-one student coordination platform for splitting food, booking shared rides, finding lost items, attending campus events, and lodging anonymous feedback.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/buzz"
            className="rounded-xl bg-black px-6 py-3 text-base font-semibold text-white transition hover:bg-gray-800 shadow-sm"
          >
            Explore Buzz Feed
          </Link>
          <Link
            href="/rooms"
            className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 transition hover:bg-gray-50 shadow-sm"
          >
            Join Live Rooms
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 text-left pt-6 border-t">
          <Link href="/buzz" className="p-4 rounded-xl border bg-white hover:shadow-sm transition">
            <span className="text-2xl">🐝</span>
            <h3 className="font-bold mt-2 text-gray-900">Campus Buzz</h3>
            <p className="text-xs text-gray-500 mt-1">Split food, cabs, buy & sell, and find lost items.</p>
          </Link>
          <Link href="/rooms" className="p-4 rounded-xl border bg-white hover:shadow-sm transition">
            <span className="text-2xl">💬</span>
            <h3 className="font-bold mt-2 text-gray-900">Live Rooms</h3>
            <p className="text-xs text-gray-500 mt-1">Real-time group chat for coordinated activities.</p>
          </Link>
          <Link href="/events" className="p-4 rounded-xl border bg-white hover:shadow-sm transition">
            <span className="text-2xl">📅</span>
            <h3 className="font-bold mt-2 text-gray-900">Events</h3>
            <p className="text-xs text-gray-500 mt-1">Hackathons, cultural fests, and workshops.</p>
          </Link>
          <Link href="/complaints" className="p-4 rounded-xl border bg-white hover:shadow-sm transition">
            <span className="text-2xl">📢</span>
            <h3 className="font-bold mt-2 text-gray-900">Complaints</h3>
            <p className="text-xs text-gray-500 mt-1">Submit 100% anonymous campus feedback.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}