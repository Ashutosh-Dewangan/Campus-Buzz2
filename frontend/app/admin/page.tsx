const stats = [
  {
    title: "Users",
    value: "842",
  },
  {
    title: "Open Complaints",
    value: "7",
  },
  {
    title: "Reports",
    value: "4",
  },
  {
    title: "Active Rooms",
    value: "12",
  },
];

export default function AdminPage() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">
        Admin Dashboard
      </h1>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-2xl border bg-white p-6"
          >
            <p className="text-sm text-gray-500">
              {stat.title}
            </p>

            <p className="mt-2 text-3xl font-bold">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          "Users",
          "Posts",
          "Complaints",
          "Reports",
          "Events",
          "Rooms",
        ].map((section) => (
          <button
            key={section}
            className="rounded-2xl border bg-white p-6 text-left font-semibold hover:bg-gray-50"
          >
            Manage {section}
          </button>
        ))}
      </div>
    </main>
  );
}