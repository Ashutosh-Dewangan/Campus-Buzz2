import { Event } from "@/types";

interface EventCardProps {
  event: Event;
  onViewDetails?: (event: Event) => void;
}

export default function EventCard({
  event,
  onViewDetails,
}: EventCardProps) {
  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition">
      <h2 className="text-xl font-bold text-gray-900">
        {event.name}
      </h2>

      <div className="mt-3 space-y-1 text-sm text-gray-600">
        <p>📅 {event.date}</p>
        <p>🕐 {event.time}</p>
        <p>📍 {event.venue}</p>
      </div>

      <p className="mt-4 text-sm leading-6 text-gray-600 line-clamp-3">
        {event.description}
      </p>

      <button
        onClick={() => onViewDetails?.(event)}
        className="mt-5 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 cursor-pointer"
      >
        View Details
      </button>
    </article>
  );
}
