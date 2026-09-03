"use client";

import { useState, useEffect } from "react";

const leaderboardLines = [
  "ARCADE HIGH-SCORE BOARD",
  "HACKATHON WINNERS",
  "  1. SPJKE-HUMKS  1. SP3KE-HAWKS",
  "  BBR_RAK         2. DUSTIN_D",
  "CODING CHALLENGE TOPPERS",
  "  1. BBR_RAK       1. SPJKE-HAWKS",
  "  2. DUSTIN_D      2. DUSTIN_D",
  "SPORTS RESULTS",
  "  1. DUSTIN_D      1. DUSTIN_D",
  "  2. DUSTIN_D      2. DUSTIN_D",
];

const walkieLines = [
  "CHANNEL 7: Code Red — AV Club meeting!",
  "01 5: Lost item, high-score before",
  "01 2: Announcements: over new month ago",
  "01 2: Retsl blog announced sent",
  "01 2: Lost week: onpoe the siren secrets.",
];

const statsData = [
  { tag: "#FOODSPLIT", color: "var(--tag-food)", stat1: "38 active rooms", stat2: "" },
  { tag: "#CABSPLIT",  color: "var(--tag-cab)",  stat1: "17 news posts",  stat2: "" },
  { tag: "#RESELL",   color: "var(--tag-resell)", stat1: "11 new posts",  stat2: "" },
  { tag: "#LOST",     color: "var(--tag-lost)",   stat1: "5 unresolved",  stat2: "" },
];

export default function CampusPulse() {
  const [visibleLines, setVisibleLines] = useState(0);

  // Animate terminal lines appearing
  useEffect(() => {
    if (visibleLines >= walkieLines.length) return;
    const t = setTimeout(
      () => setVisibleLines((v) => v + 1),
      600
    );
    return () => clearTimeout(t);
  }, [visibleLines]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Campus Pulse panel */}
      <div className="campus-pulse-panel">
        <div className="pulse-header">CAMPUS PULSE</div>
        <div className="pulse-subheader" style={{ marginBottom: 10 }}>
          WHAT'S HOWING NIGDIT NOW
        </div>

        {/* Retro leaderboard terminal */}
        <div className="retro-terminal" style={{ fontSize: 10, lineHeight: 1.55, minHeight: 140 }}>
          {leaderboardLines.map((line, i) => (
            <div key={i} style={{
              fontWeight: line.startsWith(" ") ? 400 : 700,
              color: line.startsWith("ARCADE") || line.endsWith("BOARD") || line.endsWith("WINNERS") || line.endsWith("TOPPERS") || line.endsWith("RESULTS")
                ? "var(--terminal-fg)"
                : "#ccc",
            }}>
              {line}
            </div>
          ))}
        </div>

        {/* Stats grid */}
        <div className="pulse-stats-grid">
          {statsData.map((s) => (
            <div key={s.tag} className="pulse-stat-cell">
              <div className="pulse-stat-tag" style={{ color: s.color }}>
                {s.tag}
              </div>
              <div className="pulse-stat-value">{s.stat1}</div>
            </div>
          ))}
        </div>

        {/* Next up */}
        <div className="next-up-card">
          <div className="next-up-label">NEXT UP</div>
          <div className="next-up-title">Freshers' Open Mic</div>
          <div className="next-up-detail">TODAY · 8:00 PM · AUDITORIUM</div>
          <button className="retro-btn" style={{ fontSize: 11, padding: "5px 12px" }}>
            📺 VIEW ROOM
          </button>
        </div>
      </div>

      {/* Walkie-Talkie Channel Feed */}
      <div className="campus-pulse-panel">
        <div className="walkie-header">
          <div>
            <div className="walkie-title">Walkie-Talkie</div>
            <div className="walkie-title">Channel Feed</div>
          </div>
          <div className="walkie-freq">FRE.0..09</div>
        </div>

        <div className="retro-terminal" style={{ minHeight: 120, maxHeight: 140 }}>
          {walkieLines.slice(0, visibleLines).map((line, i) => (
            <div key={i}>{line}</div>
          ))}
          {visibleLines < walkieLines.length && (
            <span className="cursor-blink">▋</span>
          )}
        </div>
      </div>

      {/* Stay in the Loop */}
      <div className="stay-loop-card">
        {/* Spider web deco */}
        <svg
          className="spider-web-deco"
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ right: -10, top: -10, opacity: 0.18 }}
        >
          <SpiderWebSvgPaths />
        </svg>

        <div className="stay-loop-title">STAY IN<br />THE LOOP.</div>
        <div className="stay-loop-sub">
          Verified students. Real campus coordination.
        </div>
      </div>
    </div>
  );
}

function SpiderWebSvgPaths() {
  return (
    <>
      {/* Radial lines from center */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 8;
        const x = 80 + 75 * Math.cos(angle);
        const y = 80 + 75 * Math.sin(angle);
        return (
          <line
            key={i}
            x1="80" y1="80"
            x2={x} y2={y}
            stroke="currentColor" strokeWidth="1"
          />
        );
      })}
      {/* Concentric arcs */}
      {[20, 38, 56, 74].map((r, i) => (
        <circle key={i} cx="80" cy="80" r={r} stroke="currentColor" strokeWidth="1" fill="none" />
      ))}
    </>
  );
}
