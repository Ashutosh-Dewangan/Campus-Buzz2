export default function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <h1 className="text-xl font-bold">
          Campus Buzz
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="rounded-full p-2 hover:bg-slate-100"
          aria-label="Notifications"
        >
          🔔
        </button>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold">
          A
        </div>
      </div>
    </header>
  );
}