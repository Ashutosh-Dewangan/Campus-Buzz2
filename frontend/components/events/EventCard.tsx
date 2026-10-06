import { Event } from "@/types";
import { CalendarIcon, ClockIcon, PinIcon, CheckIcon } from "@/components/ui/Icons";

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
            <span
              className="tag-pill tag-found tag-pill--active shrink-0 text-[10px] inline-flex items-center gap-1"
              title="RSVP is saved locally on this device"
            >
              <CheckIcon className="h-3 w-3 shrink-0" />
              <span>Going</span>
            </span>
          )}
        </div>

        <div className="mt-3 space-y-1.5 text-xs font-semibold text-[var(--fg-muted)]">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-3.5 w-3.5 text-[var(--neon-yellow)] shrink-0" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="h-3.5 w-3.5 text-[var(--neon-yellow)] shrink-0" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <PinIcon className="h-3.5 w-3.5 text-[var(--neon-yellow)] shrink-0" />
            <span>{event.venue}</span>
          </div>
          {event.createdBy && (
            <div className="pt-0.5 text-[11px] text-[var(--fg-muted)]">
              Organized by <strong className="text-white">{event.createdBy}</strong>
            </div>
          )}
        </div>

        <p className="font-readable mt-3.5 line-clamp-3 text-sm leading-relaxed text-[var(--fg-muted)]">
          {event.description}
        </p>
      </div>

      <div className="mt-5 space-y-2">
        {onRsvp && (
          <button
            type="button"
            onClick={onRsvp}
            title="RSVP is stored locally on this device"
            className={`comic-btn w-full text-xs ${isRsvped ? "tag-found" : ""}`}
            style={isRsvped ? { background: "var(--tag-found)", color: "#04120e" } : undefined}
          >
            {isRsvped ? (
              <span className="inline-flex items-center justify-center gap-1.5">
                <CheckIcon className="h-3.5 w-3.5 shrink-0" />
                <span>Saved on Device (Going)</span>
              </span>
            ) : (
              "RSVP (Save to this device)"
            )}
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
