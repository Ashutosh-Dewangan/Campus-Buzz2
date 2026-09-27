import { OfficialPost } from "@/types";

interface Props {
  post: OfficialPost;
}

export default function OfficialPostCard({
  post,
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
    <article className="comic-card flex flex-col justify-between p-6">
      <div>
        <div className="flex items-center justify-between gap-2">
          <p
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider"
            style={{ color: "var(--neon-cyan)" }}
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: "var(--neon-cyan)", boxShadow: "0 0 6px var(--neon-cyan)" }}
            />
            {post.organization}
          </p>
          <span className="tag-pill tag-cab text-[10px]">Verified</span>
        </div>

        <p className="mt-3.5 leading-relaxed whitespace-pre-wrap text-sm" style={{ color: "var(--fg)" }}>
          {post.content}
        </p>

        {post.formUrl && (
          <div className="mt-4">
            <a
              href={post.formUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="comic-btn inline-flex items-center gap-1.5 text-xs"
            >
              <span>📋</span> Open Registration Form ↗
            </a>
          </div>
        )}
      </div>

      <div
        className="mt-5 border-t pt-3 flex items-center justify-between text-xs"
        style={{ borderColor: "#000", color: "var(--fg-muted)" }}
      >
        {post.eventName ? (
          <span className="flex items-center gap-1 font-semibold text-white">
            <span>📅</span> {post.eventName}
          </span>
        ) : (
          <span />
        )}

        {formattedDate && (
          <time dateTime={post.createdAt} className="text-[11px]">
            {formattedDate}
          </time>
        )}
      </div>
    </article>
  );
}
