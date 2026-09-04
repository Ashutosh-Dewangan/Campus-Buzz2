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
    <div className="comic-card p-5">
      <p className="text-sm font-medium" style={{ color: "var(--fg-muted)" }}>
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs" style={{ color: "var(--fg-muted)" }}>
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
    <main className="comic-page">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-7">
          <div className="flex items-center gap-2">
            <h1 className="comic-title">Admin Dashboard</h1>
            <span className="tag-pill tag-food">Restricted</span>
          </div>

          <p className="comic-sub">
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
          <h2 className="stay-loop-title">Management & Governance</h2>
          <p className="comic-sub">
            Manage core campus infrastructure and review pipelines.
          </p>

          <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardSections.map((section) => (
              <div
                key={section.title}
                className="comic-card flex flex-col justify-between p-5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center text-xl" style={{ border: "3px solid #000" }}>
                      {section.icon}
                    </span>
                    <span className="tag-pill tag-cab">
                      {section.badge}
                    </span>
                  </div>

                  <h3 className="mt-4 font-bold">
                    {section.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5" style={{ color: "var(--fg-muted)" }}>
                    {section.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    alert(`Management interface for ${section.title} is linked to backend admin APIs.`)
                  }
                  className="comic-btn-outline mt-5 w-full"
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