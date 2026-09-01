import { Complaint } from "@/types";

interface ComplaintCardProps {
  complaint: Complaint;
  canResolve: boolean;
  onResolve: (id: string) => void;
}

export default function ComplaintCard({
  complaint,
  canResolve,
  onResolve,
}: ComplaintCardProps) {
  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-800 flex items-center gap-1.5 text-sm">
          <span className="inline-block h-2 w-2 rounded-full bg-gray-400"></span>
          Anonymous Student
        </span>

        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            complaint.status === "OPEN"
              ? "bg-orange-50 text-orange-600 border border-orange-200"
              : "bg-green-50 text-green-600 border border-green-200"
          }`}
        >
          {complaint.status}
        </span>
      </div>

      <h2 className="mt-4 text-lg font-bold text-gray-900">
        {complaint.title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-gray-600">
        {complaint.description}
      </p>

      {canResolve &&
        complaint.status === "OPEN" && (
          <button
            onClick={() => onResolve(complaint.id)}
            className="mt-4 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 cursor-pointer"
          >
            Mark Resolved
          </button>
        )}
    </article>
  );
}
