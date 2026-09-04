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
    <article className="comic-card flex flex-col justify-between p-5">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h2 className="stay-loop-title" style={{ fontSize: 22 }}>
            {event.name}
          </h2>
          {isRsvped && (
            <span className="tag-pill tag-found tag-pill--active shrink-0">
              Going
            </span>
          )}
        </div>

        <div className="mt-3 space-y-1 text-sm" style={{ color: "var(--fg-muted)" }}>
          <p>📅 {event.date}</p>
          <p>🕐 {event.time}</p>
          <p>📍 {event.venue}</p>
          {event.createdBy && (
            <p className="text-xs" style={{ color: "var(--fg-muted)" }}>🏛 By {event.createdBy}</p>
          )}
        </div>

        <p className="mt-4 line-clamp-3 text-sm leading-6" style={{ color: "var(--fg-muted)" }}>
          {event.description}
        </p>
      </div>

      <div className="mt-5 space-y-2">
        {onRsvp && (
          <button
            type="button"
            onClick={onRsvp}
            className={`comic-btn w-full ${isRsvped ? "tag-found" : ""}`}
            style={isRsvped ? { background: "var(--tag-found)", color: "#04120e" } : undefined}
          >
            {isRsvped ? "✓ Going" : "RSVP"}
          </button>
        )}

        {onViewDetails && (
          <button
            type="button"
            onClick={() => onViewDetails(event)}
            className="comic-btn-outline mt-2 w-full"
          >
            View Details
          </button>
        )}
      </div>
    </article>
  );
}
