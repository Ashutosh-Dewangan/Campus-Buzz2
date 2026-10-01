import { Complaint } from "@/types";
import { LockIcon } from "@/components/ui/Icons";

interface ComplaintCardProps {
  complaint: Complaint;
  canResolve?: boolean;
  onResolve?: ((id: string) => void) | (() => void);
  showAdminIdentity?: boolean;
}

export default function ComplaintCard({
  complaint,
  canResolve = true,
  onResolve,
  showAdminIdentity = false,
}: ComplaintCardProps) {
  const isResolved = complaint.status === "RESOLVED";

  function handleResolveClick() {
    if (!onResolve) return;

    if (onResolve.length > 0) {
      (onResolve as (id: string) => void)(complaint.id);
    } else {
      (onResolve as () => void)();
    }
  }

  const formattedDate = complaint.createdAt
    ? new Date(complaint.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "Recently";

  return (
    <article className="comic-card flex flex-col justify-between p-5 transition-all duration-150 hover:-translate-y-0.5">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="mb-3 flex items-center gap-2.5">
            <span
              className="flex h-8 w-8 items-center justify-center border-2 border-black bg-[#16192b]"
              style={{ boxShadow: "2px 2px 0 #000" }}
            >
              <LockIcon className="h-4 w-4 text-[var(--neon-cyan)]" />
            </span>

            <div>
              <p className="text-sm font-bold text-white">
                Anonymous Student
              </p>

              <p className="text-[10px] font-bold text-[var(--neon-cyan)]">
                Identity protected · {formattedDate}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span
              className={`tag-pill text-[10px] ${
                isResolved ? "tag-found" : "tag-food"
              }`}
            >
              {isResolved ? "✓ Resolved" : "● Open"}
            </span>

            {complaint.category && (
              <span className="rounded-sm border border-black/60 bg-black/40 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                {complaint.category}
              </span>
            )}
          </div>
        </div>

        {/* Admin only identity reveal */}
        {showAdminIdentity && complaint.poster && (
          <div className="mb-2 rounded-sm border border-[var(--neon-yellow)] bg-black/60 px-2 py-2 text-[10px] font-bold text-[var(--neon-yellow)]">
            <div>Admin Verification</div>

            <div className="mt-1 text-white">
              {complaint.poster.name} · Roll #{complaint.poster.rollNumber}
            </div>

            <div className="mt-0.5 text-[var(--fg-muted)]">
              {complaint.poster.instituteEmail}
            </div>
          </div>
        )}

        <h2 className="mt-1 stay-loop-title" style={{ fontSize: 20 }}>
          {complaint.title}
        </h2>

        <p className="font-readable mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
          {complaint.description}
        </p>
      </div>

      {!isResolved && canResolve && onResolve && (
        <div
          className="mt-5 flex justify-end border-t pt-3"
          style={{ borderColor: "#000" }}
        >
          <button
            type="button"
            onClick={handleResolveClick}
            className="retro-btn cursor-pointer px-3 py-1 text-xs"
          >
            ✓ Mark Resolved
          </button>
        </div>
      )}
    </article>
  );
}