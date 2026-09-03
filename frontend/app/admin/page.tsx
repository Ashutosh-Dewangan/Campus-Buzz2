"use client";

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-gray-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-400">
        {description}
      </p>
    </div>
  );
}

const dashboardSections = [
  {
    title: "Users",
    description: "Manage campus accounts, verify student rolls, and assign roles.",
    icon: "👥",
    badge: "Access control",
  },
  {
    title: "Complaints",
    description: "Review and resolve anonymous hostel, mess, and facility issues.",
    icon: "📢",
    badge: "Action required",
  },
  {
    title: "Moderation",
    description: "Inspect reported posts, abusive content, and chat room flags.",
    icon: "🛡️",
    badge: "Review queue",
  },
  {
    title: "Events",
    description: "Oversee campus activities, hackathons, and organizer approvals.",
    icon: "📅",
    badge: "Scheduling",
  },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-7">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Admin Dashboard
            </h1>
            <span className="rounded-full bg-black px-2.5 py-1 text-xs font-semibold text-white">
              Restricted
            </span>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            System overview and campus governance controls.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Users"
            value="—"
            description="Verified campus accounts"
          />

          <StatCard
            label="Open complaints"
            value="—"
            description="Awaiting resolution"
          />

          <StatCard
            label="Reports"
            value="—"
            description="Content requiring review"
          />

          <StatCard
            label="Events"
            value="—"
            description="Upcoming campus events"
          />
        </div>

        {/* Four Dashboard Sections */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-900">
            Management & Governance
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage core campus infrastructure and review pipelines.
          </p>

          <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardSections.map((section) => (
              <div
                key={section.title}
                className="flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-xl">
                      {section.icon}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                      {section.badge}
                    </span>
                  </div>

                  <h3 className="mt-4 font-bold text-gray-900">
                    {section.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    {section.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    alert(`Management interface for ${section.title} is linked to backend admin APIs.`)
                  }
                  className="mt-5 w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  Manage {section.title}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}