"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { getComplaints, getEvents, getPosts, resolveComplaint } from "@/lib/api";
import { parseEventDate } from "@/lib/date";
import { Complaint, Event, Post } from "@/types";

function StatCard({
  label,
  value,
  description,
  accent,
}: {
  label: string;
  value: string | number;
  description: string;
  accent?: string;
}) {
  return (
    <div className="comic-card p-5">
      <p className="text-xs font-extrabold uppercase tracking-wider" style={{ color: accent || "var(--fg-muted)" }}>
        {label}
      </p>

      <p className="mt-2 text-3xl font-extrabold tracking-tight text-white">
        {value}
      </p>

      <p className="mt-1 text-xs" style={{ color: "var(--fg-muted)" }}>
        {description}
      </p>
    </div>
  );
}

export default function AdminPage() {
  const user = useCurrentUser();
  const isUserAdmin = user ? isAdmin(user.role) : false;

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [triageMessage, setTriageMessage] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [complaintData, eventData, postData] = await Promise.allSettled([
        getComplaints(),
        getEvents(),
        getPosts(),
      ]);

      if (complaintData.status === "fulfilled" && Array.isArray(complaintData.value)) {
        setComplaints(complaintData.value);
      }
      if (eventData.status === "fulfilled" && Array.isArray(eventData.value)) {
        setEvents(eventData.value);
      }
      if (postData.status === "fulfilled" && Array.isArray(postData.value)) {
        setPosts(postData.value);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isUserAdmin) return;
    let ignore = false;

    async function fetchInitial() {
      try {
        const [complaintData, eventData, postData] = await Promise.allSettled([
          getComplaints(),
          getEvents(),
          getPosts(),
        ]);

        if (!ignore) {
          if (complaintData.status === "fulfilled" && Array.isArray(complaintData.value)) {
            setComplaints(complaintData.value);
          }
          if (eventData.status === "fulfilled" && Array.isArray(eventData.value)) {
            setEvents(eventData.value);
          }
          if (postData.status === "fulfilled" && Array.isArray(postData.value)) {
            setPosts(postData.value);
          }
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchInitial();
    return () => {
      ignore = true;
    };
  }, [isUserAdmin]);

  async function handleQuickResolve(id: string) {
    try {
      await resolveComplaint(id);
      setComplaints((current) =>
        current.map((c) => (c.id === id ? { ...c, status: "RESOLVED" } : c))
      );
      setTriageMessage("Complaint marked as resolved.");
      setTimeout(() => setTriageMessage(""), 3000);
    } catch {
      setTriageMessage("Failed to resolve complaint.");
      setTimeout(() => setTriageMessage(""), 3000);
    }
  }

  // Not an admin
  if (!isUserAdmin) {
    return (
      <main className="comic-page">
        <div className="mx-auto max-w-7xl">
          <div className="comic-card p-12 text-center">
            <div
              style={{
                fontSize: 40,
                marginBottom: 16,
                fontFamily: "var(--font-display)",
                letterSpacing: "0.04em",
                color: "var(--accent)",
              }}
            >
              🚫
            </div>
            <h1 className="stay-loop-title" style={{ fontSize: 28 }}>
              Access Restricted
            </h1>
            <p className="comic-sub mt-3 mx-auto max-w-sm">
              This area is restricted to administrators. Only accounts with the ADMIN role can access governance tools.
            </p>
            <p className="mt-4 text-xs" style={{ color: "var(--fg-muted)" }}>
              Current account: {user?.email ?? "Guest (not signed in)"} · Role: {user?.role ?? "NONE"}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const openComplaints = complaints.filter((c) => c.status === "OPEN");
  const now = new Date();
  const upcomingEvents = events.filter((e) => {
    const d = parseEventDate(e.date, e.time);
    return Number.isNaN(d.getTime()) ? true : d >= now;
  });
  const activePosts = posts.filter((p) => p.status === "ACTIVE");

  return (
    <main className="comic-page">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="comic-title">Admin Dashboard</h1>
              <span className="tag-pill tag-food">Restricted · Live</span>
            </div>

            <p className="comic-sub">
              System governance, complaint resolution triage, and campus activity oversight.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="comic-btn-outline text-xs self-start sm:self-auto"
          >
            {isLoading ? "Refreshing..." : "↻ Refresh Live Data"}
          </button>
        </div>

        {/* Feedback Alert */}
        {triageMessage && (
          <div
            className="mb-4 border-2 border-black px-4 py-2.5 text-xs font-bold"
            style={{ background: "rgba(0,229,200,0.15)", color: "var(--tag-found)" }}
          >
            ✓ {triageMessage}
          </div>
        )}

        {/* Live Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Open Complaints"
            value={isLoading ? "..." : openComplaints.length}
            description={`${complaints.length} total submitted`}
            accent="var(--accent)"
          />

          <StatCard
            label="Upcoming Events"
            value={isLoading ? "..." : upcomingEvents.length}
            description={`${events.length} total scheduled`}
            accent="var(--neon-cyan)"
          />

          <StatCard
            label="Active Buzz Posts"
            value={isLoading ? "..." : activePosts.length}
            description={`${posts.length} total posts`}
            accent="var(--neon-yellow)"
          />

          <StatCard
            label="Moderation Queue"
            value="—"
            description="Reports API pending backend"
            accent="var(--fg-muted)"
          />
        </div>

        {/* Open Complaints Triage Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="stay-loop-title" style={{ fontSize: 22 }}>
                Complaint Triage Queue
              </h2>
              <p className="comic-sub">
                Open student complaints awaiting resolution.
              </p>
            </div>
            <Link href="/complaints" className="comic-btn text-xs">
              View All Complaints →
            </Link>
          </div>

          {openComplaints.length === 0 ? (
            <div className="comic-card comic-empty mt-4 p-8">
              <p className="text-sm font-bold" style={{ color: "var(--tag-found)" }}>
                ✓ All complaints are resolved!
              </p>
              <p className="comic-sub text-xs mt-1">
                No open student issues requiring administrative action.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {openComplaints.slice(0, 6).map((complaint) => (
                <div key={complaint.id} className="comic-card flex flex-col justify-between p-4">
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">🔒 Anonymous Student</span>
                      <span className="tag-pill tag-food text-[10px]">Open</span>
                    </div>

                    <h3 className="mt-2 text-base font-bold text-white">
                      {complaint.title}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-xs leading-5" style={{ color: "var(--fg-muted)" }}>
                      {complaint.description}
                    </p>
                  </div>

                  <div className="mt-4 border-t pt-3 flex justify-end" style={{ borderColor: "#000" }}>
                    <button
                      type="button"
                      onClick={() => handleQuickResolve(complaint.id)}
                      className="comic-btn text-xs py-1.5 px-3"
                    >
                      ✓ Mark Resolved
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Governance Surfaces */}
        <div className="mt-10">
          <h2 className="stay-loop-title" style={{ fontSize: 22 }}>
            Campus Governance Surfaces
          </h2>
          <p className="comic-sub">
            Direct navigation to campus moderation and publishing channels.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Link href="/official" className="comic-card p-5 transition hover:scale-[1.01] block">
              <div className="flex items-center justify-between">
                <span className="text-2xl">📢</span>
                <span className="tag-pill tag-cab text-[10px]">Publisher</span>
              </div>
              <h3 className="mt-3 text-base font-bold text-white">Official Notices</h3>
              <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                Publish announcements, registration links, and verified institutional notices.
              </p>
            </Link>

            <Link href="/events" className="comic-card p-5 transition hover:scale-[1.01] block">
              <div className="flex items-center justify-between">
                <span className="text-2xl">📅</span>
                <span className="tag-pill tag-cab text-[10px]">Schedule</span>
              </div>
              <h3 className="mt-3 text-base font-bold text-white">Event Oversight</h3>
              <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                Schedule workshops, hackathons, and cultural nights across campus.
              </p>
            </Link>

            <Link href="/buzz" className="comic-card p-5 transition hover:scale-[1.01] block">
              <div className="flex items-center justify-between">
                <span className="text-2xl">📣</span>
                <span className="tag-pill tag-found text-[10px]">Feed</span>
              </div>
              <h3 className="mt-3 text-base font-bold text-white">Buzz Feed</h3>
              <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                Monitor active peer-to-peer student coordination, splits, and lost &amp; found posts.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}