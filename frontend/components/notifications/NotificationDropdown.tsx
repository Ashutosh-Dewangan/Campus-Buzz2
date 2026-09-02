const notifications = [
  "Someone joined your food split room.",
  "New message in your cab split room.",
  "Your post expires in 30 minutes.",
  "Hackathon starts tomorrow.",
];

export default function NotificationDropdown() {
  return (
    <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border bg-white p-4 shadow-xl">
      <h2 className="font-bold">
        Notifications
      </h2>

      <div className="mt-3 divide-y">
        {notifications.map((notification) => (
          <div
            key={notification}
            className="py-3 text-sm text-gray-700"
          >
            {notification}
          </div>
        ))}
      </div>
    </div>
  );
}