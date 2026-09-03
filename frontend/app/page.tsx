import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 flex flex-col justify-center">
      <div className="mx-auto max-w-7xl w-full py-8 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
            <span>✨</span>
            <span>All-in-one Campus Coordination Platform</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Welcome to <span className="text-black underline decoration-blue-500">Campus Buzz</span>
          </h1>

          <p className="text-base text-gray-600 sm:text-lg">
            The all-in-one student coordination platform for splitting food, booking shared rides, finding lost items, attending campus events, and lodging anonymous feedback.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/buzz"
              className="cursor-pointer rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              Explore Buzz Feed
            </Link>
            <Link
              href="/rooms"
              className="cursor-pointer rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              Join Live Rooms
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 text-left sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/buzz"
              className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-xl">
                  🐝
                </span>
                <h3 className="mt-4 font-bold text-gray-900">Campus Buzz</h3>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Split food, cabs, buy & sell, and report lost or found items.
                </p>
              </div>
              <span className="mt-4 text-xs font-semibold text-black">
                View feed →
              </span>
            </Link>

            <Link
              href="/rooms"
              className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-xl">
                  💬
                </span>
                <h3 className="mt-4 font-bold text-gray-900">Live Rooms</h3>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Real-time group chat for coordinated activities and splits.
                </p>
              </div>
              <span className="mt-4 text-xs font-semibold text-black">
                Join rooms →
              </span>
            </Link>

            <Link
              href="/events"
              className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-xl">
                  📅
                </span>
                <h3 className="mt-4 font-bold text-gray-900">Events</h3>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Hackathons, cultural fests, workshops, and RSVP coordination.
                </p>
              </div>
              <span className="mt-4 text-xs font-semibold text-black">
                Browse events →
              </span>
            </Link>

            <Link
              href="/complaints"
              className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-xl">
                  📢
                </span>
                <h3 className="mt-4 font-bold text-gray-900">Complaints</h3>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Submit 100% anonymous campus feedback with identity protection.
                </p>
              </div>
              <span className="mt-4 text-xs font-semibold text-black">
                File complaint →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}