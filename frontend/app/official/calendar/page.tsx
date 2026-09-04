"use client";

export default function OfficialCalendarPage() {
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const cells = Array.from({ length: 35 }, (_, i) => i - 1);

  return (
    <main className="comic-page">
      <div className="mx-auto max-w-5xl">
        <h1 className="comic-title">CAMPUS CALENDAR</h1>
        <p className="comic-sub">Official dates, fests, and deadlines — inked in.</p>

        <div className="comic-card mt-6 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="stay-loop-title">SEPTEMBER 2026</div>
            <span className="tag-pill tag-cab">LIVE</span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((d) => (
              <div
                key={d}
                className="text-center text-[11px] font-extrabold tracking-widest"
                style={{ color: "var(--neon-yellow)" }}
              >
                {d}
              </div>
            ))}
            {cells.map((day, i) => {
              const inMonth = day >= 1 && day <= 30;
              const highlight = day === 4 || day === 12 || day === 21;
              return (
                <div
                  key={i}
                  className="min-h-16 p-2 text-sm font-bold"
                  style={{
                    border: "2px solid #000",
                    background: highlight
                      ? "rgba(255,45,74,0.28)"
                      : inMonth
                        ? "rgba(0,0,0,0.35)"
                        : "transparent",
                    color: inMonth ? "#fff" : "transparent",
                    boxShadow: highlight ? "0 0 10px rgba(255,45,74,0.4)" : undefined,
                  }}
                >
                  {inMonth ? day : "."}
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs" style={{ color: "var(--fg-muted)" }}>
            04 — Freshers&apos; Open Mic · 12 — Mid-sem week · 21 — Club fair
          </p>
        </div>
      </div>
    </main>
  );
}
