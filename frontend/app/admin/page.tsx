"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useCurrentUser, switchDemoPersona } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import {
  getAdminStats,
  getComplaints,
  getEvents,
  getReportedPosts,
  getUsers,
  dismissReport,
  removePost,
  resolveComplaint,
  toggleUserStatus,
  type AdminStats,
} from "@/lib/api";
import { Complaint, Event, ReportedPost, CampusUser } from "@/types";
import {
  CalendarIcon,
  LockIcon,
  MegaphoneIcon,
  ShieldIcon,
} from "@/components/ui/Icons";

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
      <p
        className="text-xs font-extrabold uppercase tracking-wider"
        style={{ color: accent || "var(--fg-muted)" }}
      >
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

  const [activeTab, setActiveTab] = useState<
    "OVERVIEW" | "MODERATION" | "COMPLAINTS" | "USERS"
  >("OVERVIEW");

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [reports, setReports] = useState<ReportedPost[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [users, setUsers] = useState<CampusUser[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [triageMessage, setTriageMessage] = useState("");

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        statsData,
        reportsData,
        complaintsData,
        usersData,
        eventsData,
      ] = await Promise.all([
        getAdminStats(),
        getReportedPosts(),
        getComplaints(),
        getUsers(),
        getEvents(),
      ]);

      setStats(statsData);
      setReports(reportsData);
      setComplaints(complaintsData);
      setUsers(usersData);
      setEvents(eventsData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isUserAdmin) return;
    let isMounted = true;
    (async () => {
      try {
        const [
          statsData,
          reportsData,
          complaintsData,
          usersData,
          eventsData,
        ] = await Promise.all([
          getAdminStats(),
          getReportedPosts(),
          getComplaints(),
          getUsers(),
          getEvents(),
        ]);
        if (!isMounted) return;
        setStats(statsData);
        setReports(reportsData);
        setComplaints(complaintsData);
        setUsers(usersData);
        setEvents(eventsData);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [isUserAdmin]);

  async function handleDismissReport(reportId: string) {
    await dismissReport(reportId);
    setReports((cur) =>
      cur.map((r) => (r.id === reportId ? { ...r, status: "DISMISSED" } : r))
    );
    setTriageMessage("Report dismissed.");
    setTimeout(() => setTriageMessage(""), 3000);
  }

  async function handleRemoveReportedPost(reportId: string, postId: string) {
    await removePost(reportId, postId);
    setReports((cur) =>
      cur.map((r) => (r.id === reportId ? { ...r, status: "RESOLVED" } : r))
    );
    setTriageMessage("Post removed and moderation report resolved.");
    setTimeout(() => setTriageMessage(""), 3000);
  }

  async function handleQuickResolve(id: string) {
    try {
      await resolveComplaint(id);
      setComplaints((current) =>
        current.map((c) =>
          c.id === id ? { ...c, status: "RESOLVED", resolved: true } : c
        )
      );
      setTriageMessage("Complaint marked as resolved.");
      setTimeout(() => setTriageMessage(""), 3000);
    } catch {
      setTriageMessage("Failed to resolve complaint.");
      setTimeout(() => setTriageMessage(""), 3000);
    }
  }

  async function handleToggleUser(userId: string) {
    const updated = await toggleUserStatus(userId);
    if (updated) {
      setUsers((cur) =>
        cur.map((u) => (u.id === userId ? { ...u, status: updated.status } : u))
      );
      setTriageMessage(
        `User ${updated.name} is now ${updated.status}.`
      );
      setTimeout(() => setTriageMessage(""), 3000);
    }
  }

  // Restricted Access View for non-admin accounts
  if (!isUserAdmin) {
    return (
      <main className="comic-page">
        <div className="mx-auto max-w-xl py-12">
          <div className="comic-card p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-sm border-2 border-black bg-[rgba(255,45,74,0.2)] text-[var(--accent)] shadow-[2px_2px_0_#000]">
              <ShieldIcon className="h-8 w-8" />
            </div>
            <h1 className="stay-loop-title" style={{ fontSize: 28 }}>
              Admin Access Restricted
            </h1>
            <p className="comic-sub font-readable mt-3 mx-auto max-w-md">
              This area is restricted to campus administrators. Current account:{" "}
              <strong className="text-white">
                {user?.email || "Guest"}
              </strong>{" "}
              (Role: {user?.role || "NONE"}).
            </p>

            {/* Development demo switch helper */}
            <div className="mt-8 border-t border-black/40 pt-6">
              <p className="text-xs text-[var(--neon-yellow)] font-bold mb-3 uppercase tracking-wider">
                Demo / Development Switcher:
              </p>
              <button
                type="button"
                onClick={() => switchDemoPersona("ADMIN")}
                className="retro-btn text-xs font-black cursor-pointer"
              >
                Switch to Admin Persona (Preview Mode) ↗
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const pendingReports = reports.filter((r) => r.status === "PENDING");
  const openComplaints = complaints.filter((c) => c.status === "OPEN");

  return (
    <main className="comic-page">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="comic-title">Admin Dashboard</h1>
              <span className="tag-pill tag-food text-[10px]">Restricted · Live</span>
            </div>
            <p className="comic-sub">
              System governance, complaint resolution triage, moderation, and user management.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshData}
            disabled={isLoading}
            className="comic-btn-outline text-xs self-start sm:self-auto cursor-pointer"
          >
            {isLoading ? "Refreshing..." : "↻ Refresh Live Data"}
          </button>
        </div>

        {/* Feedback Alert */}
        {triageMessage && (
          <div
            className="mb-4 border-2 border-black px-4 py-2.5 text-xs font-bold shadow-[2px_2px_0_#000]"
            style={{
              background: "rgba(0,229,200,0.15)",
              color: "var(--tag-found)",
            }}
          >
            ✓ {triageMessage}
          </div>
        )}

        {/* Admin Section Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {[
            { id: "OVERVIEW", label: "Overview" },
            {
              id: "MODERATION",
              label: `Moderation (${pendingReports.length})`,
            },
            {
              id: "COMPLAINTS",
              label: `Complaints (${openComplaints.length})`,
            },
            { id: "USERS", label: `Users Directory (${users.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`filter-pill cursor-pointer ${
                activeTab === tab.id ? "filter-pill--active" : ""
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === "OVERVIEW" && (
          <div className="space-y-8">
            {/* Live Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <StatCard
                label="Total Users"
                value={isLoading ? "..." : stats?.totalUsers || users.length}
                description="Verified accounts"
                accent="var(--neon-cyan)"
              />
              <StatCard
                label="Active Rooms"
                value={isLoading ? "..." : stats?.activeRooms ?? 4}
                description="Live student splits"
                accent="var(--neon-green)"
              />
              <StatCard
                label="Open Complaints"
                value={isLoading ? "..." : openComplaints.length}
                description={`${complaints.length} total submitted`}
                accent="var(--accent)"
              />
              <StatCard
                label="Pending Reports"
                value={isLoading ? "..." : pendingReports.length}
                description="Awaiting review"
                accent="var(--neon-yellow)"
              />
              <StatCard
                label="Upcoming Events"
                value={isLoading ? "..." : stats?.upcomingEvents || events.length}
                description="Scheduled activities"
                accent="var(--tag-cab)"
              />
            </div>

            {/* Quick Governance Links */}
            <div>
              <h2 className="stay-loop-title" style={{ fontSize: 22 }}>
                Campus Governance Channels
              </h2>
              <p className="comic-sub">
                Quick administrative shortcuts to moderate and oversee live features.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <Link
                  href="/official"
                  className="comic-card p-5 transition hover:scale-[1.01] block"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-sm border-2 border-black bg-[rgba(255,225,53,0.15)] shadow-[2px_2px_0_#000]">
                      <MegaphoneIcon className="h-5 w-5 text-[var(--neon-yellow)]" />
                    </span>
                    <span className="tag-pill tag-cab text-[10px]">Publisher</span>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-white">
                    Official Notices
                  </h3>
                  <p
                    className="font-readable mt-1 text-xs leading-relaxed"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    Publish institutional announcements, forms, and verified notices.
                  </p>
                </Link>

                <Link
                  href="/events"
                  className="comic-card p-5 transition hover:scale-[1.01] block"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-sm border-2 border-black bg-[rgba(42,240,255,0.15)] shadow-[2px_2px_0_#000]">
                      <CalendarIcon className="h-5 w-5 text-[var(--neon-cyan)]" />
                    </span>
                    <span className="tag-pill tag-cab text-[10px]">Schedule</span>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-white">
                    Events Oversight
                  </h3>
                  <p
                    className="font-readable mt-1 text-xs leading-relaxed"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    Schedule workshops, hackathons, and cultural nights.
                  </p>
                </Link>

                <Link
                  href="/buzz"
                  className="comic-card p-5 transition hover:scale-[1.01] block"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-sm border-2 border-black bg-[rgba(0,229,200,0.15)] shadow-[2px_2px_0_#000]">
                      <MegaphoneIcon className="h-5 w-5 text-[var(--tag-found)]" />
                    </span>
                    <span className="tag-pill tag-found text-[10px]">Feed</span>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-white">
                    Campus Buzz Feed
                  </h3>
                  <p
                    className="font-readable mt-1 text-xs leading-relaxed"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    Monitor active student coordination, food/cab splits, and recovery.
                  </p>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: MODERATION ================= */}
        {activeTab === "MODERATION" && (
          <div className="space-y-4">
            <div>
              <h2 className="stay-loop-title" style={{ fontSize: 22 }}>
                Reported Posts Moderation Queue
              </h2>
              <p className="comic-sub">
                Review flagged posts reported by verified students and faculty.
              </p>
            </div>

            {pendingReports.length === 0 ? (
              <div className="comic-card comic-empty p-10">
                <p className="text-sm font-bold text-emerald-400">
                  ✓ Moderation queue clean!
                </p>
                <p className="comic-sub mt-1 text-xs">
                  No posts currently flagged for community guideline violations.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingReports.map((report) => (
                  <div
                    key={report.id}
                    className="comic-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="tag-pill tag-food text-[9px]">
                          Flagged
                        </span>
                        <span className="text-xs text-[var(--fg-muted)]">
                          Reported by: <strong>{report.reportedBy}</strong>
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white">
                        {report.postTitle}
                      </h3>
                      <p className="text-xs text-[var(--accent)] font-semibold">
                        Reason: &quot;{report.reason}&quot;
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDismissReport(report.id)}
                        className="comic-btn-outline text-xs py-1.5 px-3 cursor-pointer"
                      >
                        Dismiss Report
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveReportedPost(report.id, report.postId)
                        }
                        className="retro-btn text-xs py-1.5 px-3 cursor-pointer"
                      >
                        Remove Post ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: COMPLAINTS ================= */}
        {activeTab === "COMPLAINTS" && (
          <div className="space-y-4">
            <div>
              <h2 className="stay-loop-title" style={{ fontSize: 22 }}>
                Complaint Triage &amp; Identity Verification
              </h2>
              <p className="comic-sub">
                Students see Anonymous Student publicly. Admin accounts can view roll numbers for verification.
              </p>
            </div>

            {complaints.length === 0 ? (
              <div className="comic-card comic-empty p-8">
                <p className="comic-sub">No complaints submitted.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {complaints.map((c) => (
                  <div
                    key={c.id}
                    className="comic-card flex flex-col justify-between p-4"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="inline-flex items-center gap-1 rounded-sm border border-[var(--neon-yellow)] bg-black/60 px-2 py-0.5 text-[10px] font-bold text-[var(--neon-yellow)]">
                          <LockIcon className="h-3 w-3 shrink-0" />
                          <span>
                          Poster: Roll #{c.poster?.rollNumber || "Verified Student"}
                          </span>
                        </span>
                        <span
                          className={`tag-pill text-[9px] ${
                            c.status === "RESOLVED" ? "tag-found" : "tag-food"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white">{c.title}</h3>
                      <p
                        className="font-readable mt-1 line-clamp-3 text-xs leading-relaxed"
                        style={{ color: "var(--fg-muted)" }}
                      >
                        {c.description}
                      </p>
                    </div>

                    <div
                      className="mt-4 border-t pt-3 flex items-center justify-between"
                      style={{ borderColor: "#000" }}
                    >
                      <span className="text-[10px] text-[var(--fg-muted)]">
                        Category: {c.category || "General"}
                      </span>
                      {c.status === "OPEN" && (
                        <button
                          type="button"
                          onClick={() => handleQuickResolve(c.id)}
                          className="retro-btn text-[10px] py-1 px-2.5 cursor-pointer"
                        >
                          ✓ Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: USERS ================= */}
        {activeTab === "USERS" && (
          <div className="space-y-4">
            <div>
              <h2 className="stay-loop-title" style={{ fontSize: 22 }}>
                Campus Directory &amp; Role Management
              </h2>
              <p className="comic-sub">
                Manage student, club, and committee active states.
              </p>
            </div>

            <div className="comic-card overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-black bg-black/50 text-[10px] font-black uppercase tracking-wider text-[var(--neon-yellow)]">
                    <th className="p-3">User</th>
                    <th className="p-3">Roll Number</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Joined</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/30">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/5 transition">
                      <td className="p-3 font-bold text-white">
                        <div>{u.name}</div>
                        <div className="text-[10px] text-[var(--fg-muted)] font-normal">
                          {u.email}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-[var(--neon-cyan)]">
                        {u.rollNumber}
                      </td>
                      <td className="p-3">
                        <span
                          className={`tag-pill text-[9px] ${
                            u.role === "ADMIN"
                              ? "tag-food"
                              : u.role === "CLUB" || u.role === "COMMITTEE"
                              ? "tag-cab"
                              : "tag-found"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-[var(--fg-muted)]">
                        {u.joinedDate}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 font-bold text-[10px] ${
                            u.status === "ACTIVE"
                              ? "text-emerald-400"
                              : "text-[var(--accent)]"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              u.status === "ACTIVE"
                                ? "bg-emerald-400"
                                : "bg-[var(--accent)]"
                            }`}
                          />
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {u.role !== "ADMIN" && (
                          <button
                            type="button"
                            onClick={() => handleToggleUser(u.id)}
                            className="retro-btn-outline text-[10px] py-0.5 px-2 cursor-pointer"
                          >
                            {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}