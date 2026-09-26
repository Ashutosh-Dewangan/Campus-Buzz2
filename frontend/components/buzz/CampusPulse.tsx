"use client";

import { useMemo } from "react";
import { Post } from "@/types";

interface CampusPulseProps {
  posts?: Post[];
}

const categories = [
  { tag: "#FOODSPLIT", interactionType: "FOOD_SPLIT", color: "var(--tag-food)" },
  { tag: "#CABSPLIT",  interactionType: "CAB_SPLIT",  color: "var(--tag-cab)"  },
  { tag: "#RESELL",    interactionType: "RESELL",      color: "var(--tag-resell)" },
  { tag: "#LOST",      interactionType: "LOST",        color: "var(--tag-lost)"  },
  { tag: "#FOUND",     interactionType: "FOUND",       color: "var(--tag-found)" },
] as const;

export default function CampusPulse({ posts = [] }: CampusPulseProps) {
  const activePosts = useMemo(
    () => posts.filter((p) => p.status === "ACTIVE"),
    [posts]
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const cat of categories) {
      map[cat.interactionType] = activePosts.filter(
        (p) => p.interactionType === cat.interactionType
      ).length;
    }
    return map;
  }, [activePosts]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="campus-pulse-panel">
        <div className="pulse-header">CAMPUS PULSE</div>
        <div className="pulse-subheader" style={{ marginBottom: 10 }}>
          Active now
        </div>

        {categories.map((cat, i) => {
          const count = counts[cat.interactionType] ?? 0;
          return (
            <div key={cat.tag} className="pulse-rank">
              <span className="pulse-rank-num">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="pulse-rank-tag" style={{ color: cat.color }}>
                {cat.tag}
              </span>
              <span className="pulse-rank-meta">
                {count === 0 ? "no posts" : `${count} active`}
              </span>
            </div>
          );
        })}
      </div>

      <div className="stay-loop-card">
        <div className="stay-loop-title">
          Don&apos;t miss what&apos;s happening.
        </div>
        <div className="stay-loop-sub">
          Verified students. Real campus coordination.
        </div>
      </div>
    </div>
  );
}
