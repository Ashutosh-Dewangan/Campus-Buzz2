import { OfficialPost } from "@/types";

interface Props {
  post: OfficialPost;
}

export default function OfficialPostCard({
  post,
}: Props) {
  return (
    <article className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition">
      <p className="text-sm font-semibold text-blue-600 flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
        {post.organization}
      </p>

      <p className="mt-3 text-gray-800 leading-relaxed whitespace-pre-wrap">
        {post.content}
      </p>

      {post.formUrl && (
        <a
          href={post.formUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition"
        >
          Open Form
        </a>
      )}

      {post.eventName && (
        <p className="mt-4 text-sm text-gray-500 border-t pt-3">
          Event: <span className="font-medium text-gray-700">{post.eventName}</span>
        </p>
      )}
    </article>
  );
}
