import { Complaint } from "@/types";

interface ComplaintCardProps {
  complaint: Complaint & { resolved?: boolean };
  canResolve?: boolean;
  onResolve?: ((id: string) => void) | (() => void);
}

export default function ComplaintCard({
  complaint,
  canResolve = true,
  onResolve,
}: ComplaintCardProps) {
  const isResolved =
    Boolean(complaint.resolved) || complaint.status === "RESOLVED";

  function handleResolveClick() {
    if (!onResolve) return;
    if (onResolve.length > 0) {
      (onResolve as (id: string) => void)(complaint.id);
    } else {
      (onResolve as () => void)();
    }
  }

  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm">
              🔒
            </span>

            <div>
              <p className="text-sm font-semibold text-gray-900">
                Anonymous Student
              </p>

              <p className="text-xs text-gray-400">
                Identity protected
              </p>
            </div>
          </div>

          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              isResolved
                ? "bg-green-50 text-green-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {isResolved ? "Resolved" : "Open"}
          </span>
        </div>

        <h2 className="mt-2 text-lg font-bold text-gray-900">
          {complaint.title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          {complaint.description}
        </p>
      </div>

      {!isResolved && canResolve && onResolve && (
        <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={handleResolveClick}
            className="cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            Mark resolved
          </button>
        </div>
      )}
    </article>
  );
}
