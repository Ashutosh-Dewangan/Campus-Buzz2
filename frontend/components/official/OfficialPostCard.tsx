import Link from "next/link";
import { OfficialPost } from "@/types";
import { CalendarIcon } from "@/components/ui/Icons";

interface Props {
  post: OfficialPost;
}

export default function OfficialPostCard({ post }: Props) {
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
            {post.organization}
          </p>
          <span className="tag-pill tag-cab text-[10px] font-bold">
            ✓ Official
          </span>
        </div>

        {/* Post content */}
        <p
          className="font-readable mt-3.5 leading-relaxed whitespace-pre-wrap text-sm"
          style={{ color: "var(--fg)" }}
        >
          {post.content}
        </p>

        {/* Action Attachments: Google Form / Link */}
        <div className="mt-4 flex flex-wrap gap-2">
          {post.formUrl && (
            <a
              href={post.formUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="comic-btn inline-flex items-center gap-1.5 text-xs font-bold"
            >
              Open Registration Form ↗
            </a>
          )}

          {post.link && (
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="comic-btn-outline inline-flex items-center gap-1.5 text-xs font-bold"
            >
              Portal Link ↗
            </a>
          )}
        </div>
      </div>

      {/* Footer metadata: Linked event & timestamp */}
      <div
        className="mt-5 border-t pt-3 flex items-center justify-between text-xs"
        style={{ borderColor: "#000", color: "var(--fg-muted)" }}
      >
        {post.eventName ? (
          <Link
            href="/events"
            className="flex items-center gap-1.5 font-bold text-white hover:text-[var(--neon-cyan)] transition"
          >
            <CalendarIcon className="h-3 w-3 text-[var(--neon-yellow)] shrink-0" />
            <span className="underline underline-offset-2">{post.eventName}</span>
          </Link>
        ) : (
          <span />
        )}

        {formattedDate && (
          <time dateTime={post.createdAt} className="text-[11px] font-semibold">
            {formattedDate}
          </time>
        )}
      </div>
    </article>
  );
}
