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
    <article className="comic-card flex flex-col justify-between p-5">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm">
              🔒
            </span>

            <div>
              <p className="text-sm font-semibold">
                Anonymous Student
              </p>

              <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
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

        <h2 className="mt-2 stay-loop-title" style={{ fontSize: 22 }}>
          {complaint.title}
        </h2>

        <p className="mt-2 text-sm leading-6" style={{ color: "var(--fg-muted)" }}>
          {complaint.description}
        </p>
      </div>

      {!isResolved && canResolve && onResolve && (
        <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={handleResolveClick}
            className="comic-btn-outline"
          >
            Mark resolved
          </button>
        </div>
      )}
    </article>
  );
}
