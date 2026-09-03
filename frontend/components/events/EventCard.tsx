import { Event } from "@/types";

interface EventCardProps {
  event: Event;
  isRsvped?: boolean;
  onRsvp?: () => void;
  onViewDetails?: (event: Event) => void;
}

export default function EventCard({
  event,
  isRsvped = false,
  onRsvp,
  onViewDetails,
}: EventCardProps) {
  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-xl font-bold text-gray-900">
            {event.name}
          </h2>
          {isRsvped && (
            <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200">
              Going
            </span>
          )}
        </div>

        <div className="mt-3 space-y-1 text-sm text-gray-600">
          <p>📅 {event.date}</p>
          <p>🕐 {event.time}</p>
          <p>📍 {event.venue}</p>
          {event.createdBy && (
            <p className="text-xs text-gray-400">🏛 By {event.createdBy}</p>
          )}
        </div>

        <p className="mt-4 text-sm leading-6 text-gray-600 line-clamp-3">
          {event.description}
        </p>
      </div>

      <div className="mt-5 space-y-2">
        {onRsvp && (
          <button
            type="button"
            onClick={onRsvp}
            className={`w-full cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
              isRsvped
                ? "bg-green-50 text-green-700 ring-1 ring-green-200 hover:bg-green-100"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {isRsvped ? "✓ Going" : "RSVP"}
          </button>
        )}

        {onViewDetails && (
          <button
            type="button"
            onClick={() => onViewDetails(event)}
            className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            View Details
          </button>
        )}
      </div>
    </article>
  );
}
