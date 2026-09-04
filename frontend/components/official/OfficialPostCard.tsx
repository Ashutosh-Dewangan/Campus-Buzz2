import { OfficialPost } from "@/types";

interface Props {
  post: OfficialPost;
}

export default function OfficialPostCard({
  post,
}: Props) {
  return (
    <article className="comic-card p-6">
      <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: "var(--neon-cyan)" }}>
        <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
        {post.organization}
      </p>

      <p className="mt-3 leading-relaxed whitespace-pre-wrap">
        {post.content}
      </p>

      {post.formUrl && (
        <a
          href={post.formUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="comic-btn mt-4 inline-block"
        >
          Open Form
        </a>
      )}

      {post.eventName && (
        <p className="mt-4 text-sm border-t pt-3" style={{ color: "var(--fg-muted)", borderColor: "#000" }}>
          Event: <span className="font-medium">{post.eventName}</span>
        </p>
      )}
    </article>
  );
}
