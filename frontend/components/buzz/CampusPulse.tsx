"use client";

const ranks = [
  { n: "01", tag: "#FOODSPLIT", meta: "36 active rooms", color: "var(--tag-food)" },
  { n: "02", tag: "#CABSPLIT", meta: "17 live posts", color: "var(--tag-cab)" },
  { n: "03", tag: "#LOST", meta: "5 unresolved", color: "var(--tag-lost)" },
  { n: "04", tag: "#FOUND", meta: "3 new drops", color: "var(--tag-found)" },
];

export default function CampusPulse() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="campus-pulse-panel">
        <div className="pulse-header">CAMPUS PULSE</div>
        <div className="pulse-subheader" style={{ marginBottom: 10 }}>
          WHAT&apos;S MOVING RIGHT NOW
        </div>

        {ranks.map((row) => (
          <div key={row.n} className="pulse-rank">
            <span className="pulse-rank-num">{row.n}</span>
            <span className="pulse-rank-tag" style={{ color: row.color }}>
              {row.tag}
            </span>
            <span className="pulse-rank-meta">{row.meta}</span>
          </div>
        ))}

        <div className="next-up-card">
          <div className="next-up-label">NEXT UP</div>
          <div className="next-up-title">Freshers&apos; Open Mic</div>
          <div className="next-up-detail">TODAY · 8:00 PM · AUDITORIUM</div>
          <button className="comic-btn" type="button" style={{ fontSize: 11 }}>
            VIEW EVENT
          </button>
        </div>
      </div>

      <div className="stay-loop-card">
        <div className="stay-loop-title">
          STAY IN
          <br />
          THE LOOP.
        </div>
        <div className="stay-loop-sub">
          Verified students. Real campus coordination.
        </div>
      </div>
    </div>
  );
}
