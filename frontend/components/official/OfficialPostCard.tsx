import Link from "next/link";
import { OfficialPost } from "@/types";
import { CalendarIcon } from "@/components/ui/Icons";

interface Props {
  post: OfficialPost;
  canDelete: boolean;
  onDeleted: (postId: string) => Promise<void>;
}
export default function OfficialPostCard({
  post,
  canDelete,
  onDeleted,
}: Props) {
  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <article className="comic-card flex flex-col justify-between p-6 transition-all duration-150 hover:-translate-y-0.5">
      <div>
        {/* Organization identity with verified badge */}
        <div className="flex items-center justify-between gap-2 border-b border-black/40 pb-2.5">
          <p
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider"
            style={{ color: "var(--neon-cyan)" }}
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{
                background: "var(--neon-cyan)",
                boxShadow: "0 0 6px var(--neon-cyan)",
              }}
            />

            {post.organization.name}
          </p>

          <span className="tag-pill tag-cab text-[10px] font-bold">
            ✓ Official
          </span>
        </div>

        {/* Post title */}
        <h2
          className="mt-4 text-xl font-black"
          style={{ color: "var(--fg)" }}
        >
          {post.title}
        </h2>

        {/* Post content */}
        <p
          className="font-readable mt-3.5 whitespace-pre-wrap text-sm leading-relaxed"
          style={{ color: "var(--fg)" }}
        >
          {post.content}
        </p>

        {/* Action Attachments */}
        <div className="mt-4 flex flex-wrap gap-2">
          {post.formUrl && (
            <a
              href={post.formUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="comic-btn inline-flex items-center gap-1.5 text-xs font-bold"
            >
              Open Registration Form →
            </a>
          )}

          {post.link && (
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="comic-btn-outline inline-flex items-center gap-1.5 text-xs font-bold"
            >
              Portal Link →
            </a>
          )}
        </div>
      </div>

      {/* Footer metadata */}
      <div
        className="mt-5 flex items-center justify-between border-t pt-3 text-xs"
        style={{ borderColor: "#000", color: "var(--fg-muted)" }}
      >
        {post.event && (
        <Link
          href={`/events?event=${encodeURIComponent(post.event.id)}`}
          className="comic-btn-outline inline-flex items-center gap-1.5 text-xs font-bold"
        >
          <CalendarIcon className="h-3 w-3 shrink-0 text-[var(--neon-yellow)]" />
          Go to Event →
        </Link>
        )}
        {formattedDate && (
          <time
            dateTime={post.createdAt}
            className="text-[11px] font-semibold"
          >
            {formattedDate}
          </time>
        )}
        {canDelete && (
        <button
          type="button"
          onClick={async () => {
            const confirmed = window.confirm(
              "Delete this official post? If it is linked to an event, the event will remain on the calendar.",
            );
      
            if (!confirmed) return;
      
            await onDeleted(post.id);
          }}
          className="comic-btn-outline text-xs font-bold"
        >
          Delete
        </button>
      )}
      </div>
    </article>
  );
}