"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import ComplaintCard from "@/components/complaints/ComplaintCard";
import CreateComplaint from "@/components/complaints/CreateComplaint";
import { LockIcon } from "@/components/ui/Icons";
import { Complaint, ComplaintCategory } from "@/types";
import { getComplaints, resolveComplaint } from "@/lib/api";
import { isAdmin } from "@/lib/auth";
import { useCurrentUser } from "@/lib/session";

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "RESOLVED" | "MY_COMPLAINTS">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [resolveMessage, setResolveMessage] = useState("");

  const user = useCurrentUser();
  const isUserAdmin = user ? isAdmin(user.role) : false;

  const loadComplaints = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const fetched = await getComplaints();
      if (Array.isArray(fetched)) {
        setComplaints(fetched);
      }
    } catch {
      setError("We couldn't load complaints right now.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function fetchInitial() {
      try {
        const fetched = await getComplaints();
        if (!ignore && Array.isArray(fetched)) {
          setComplaints(fetched);
        }
      } catch {
        if (!ignore) {
          setError("We couldn't load complaints right now.");
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
  }, []);

  async function handleResolve(id: string) {
    try {
      await resolveComplaint(id);
      setComplaints((current) =>
        current.map((c) =>
          c.id === id ? { ...c, status: "RESOLVED" as const, resolved: true } : c
        )
      );
      setResolveMessage("✓ Complaint marked as resolved.");
      setTimeout(() => setResolveMessage(""), 3500);
    } catch (err) {
      console.error("Error resolving complaint:", err);
      setResolveMessage("Failed to mark complaint as resolved.");
      setTimeout(() => setResolveMessage(""), 3500);
    }
  }

  function handleComplaintCreated(newComplaint: Complaint) {
    setComplaints((current) => [newComplaint, ...current]);
    setShowCreateModal(false);
    setResolveMessage("✓ Anonymous complaint submitted to campus administration.");
    setTimeout(() => setResolveMessage(""), 4000);
  }

  const filteredComplaints = useMemo(() => {
    let result = complaints;

    if (filter === "OPEN") {
      result = result.filter((c) => c.status === "OPEN");
    } else if (filter === "RESOLVED") {
      result = result.filter((c) => c.status === "RESOLVED");
    } else if (filter === "MY_COMPLAINTS") {
      result = result.filter((c) => c.userId === (user?.id || "u1"));
    }

    if (categoryFilter !== "ALL") {
      result = result.filter((c) => c.category === categoryFilter);
    }

    return result;
  }, [complaints, filter, categoryFilter, user]);

  const categories: Array<ComplaintCategory | "ALL"> = [
    "ALL",
    "Hostel",
    "Mess / Cafeteria",
    "Campus Wi-Fi",
    "Library / Facilities",
    "Academic",
  ];

  return (
    <main className="comic-page">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="comic-title">Complaints &amp; Feedback</h1>
              <span className="tag-pill tag-lost text-[10px]">Anonymous Channel</span>
            </div>
            <p className="comic-sub">
              Submit protected anonymous issues about hostel, library, internet and campus facilities.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="comic-btn text-xs"
          >
            + File Complaint
          </button>
        </div>

        {/* Resolve success message */}
        {resolveMessage && (
          <div
            className="mb-4 rounded-sm border-2 border-black px-4 py-3 text-xs font-bold shadow-[2px_2px_0_#000]"
            style={{ background: "rgba(0,229,200,0.15)", color: "var(--tag-found)" }}
          >
            {resolveMessage}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {[
            { label: "All Complaints", value: "ALL" },
            { label: "● Open Issues", value: "OPEN" },
            { label: "✓ Resolved", value: "RESOLVED" },
            { label: "My Complaints", value: "MY_COMPLAINTS" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value as typeof filter)}
              className={`filter-pill cursor-pointer ${
                filter === tab.value ? "filter-pill--active" : ""
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Sub-Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[10px] font-bold uppercase text-[var(--fg-muted)]">
            Category:
          </span>
          {categories.map((cat) => {
            const isSelected = categoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`cursor-pointer rounded-sm border px-2 py-0.5 text-[10px] font-bold transition-all ${
                  isSelected
                    ? "border-[var(--neon-cyan)] bg-[var(--neon-cyan)] text-black shadow-[1px_1px_0_#000]"
                    : "border-black/60 bg-black/40 text-[var(--fg-muted)] hover:border-white/40 hover:text-white"
                }`}
              >
                {cat === "ALL" ? "All Categories" : cat}
              </button>
            );
          })}
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="mb-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="comic-card h-52 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="comic-card comic-empty mb-6">
            <p style={{ color: "var(--accent)", fontWeight: 800 }}>Failed to load complaints</p>
            <p className="comic-sub">{error}</p>
            <button
              type="button"
              onClick={loadComplaints}
              className="comic-btn mt-4 cursor-pointer"
            >
              Try again ⟳
            </button>
          </div>
        )}

        {/* Complaints Grid */}
        {!isLoading && !error && filteredComplaints.length === 0 ? (
          <div className="comic-card comic-empty p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center border-2 border-black bg-black/40">
              <LockIcon className="h-6 w-6 text-[var(--neon-cyan)]" />
            </div>
            <h2 className="stay-loop-title mt-5">No complaints in this view</h2>
            <p className="comic-sub mx-auto max-w-md">
              {filter === "MY_COMPLAINTS"
                ? "You haven't filed any complaints yet. Use the '+ File Complaint' button to report an issue."
                : filter === "OPEN"
                ? "Great — no open issues in this category right now."
                : filter === "RESOLVED"
                ? "No resolved complaints recorded in this view."
                : "No complaints found matching the selected filter."}
            </p>
          </div>
        ) : (
          !isLoading && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredComplaints.map((complaint) => {
                const canResolveThis =
                  isUserAdmin ||
                  Boolean(
                    user?.id &&
                      complaint.userId &&
                      user.id === complaint.userId
                  );

                return (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    canResolve={canResolveThis}
                    onResolve={handleResolve}
                    showAdminIdentity={isUserAdmin}
                  />
                );
              })}
            </div>
          )
        )}

        {/* Create Complaint Modal */}
        {showCreateModal && (
          <CreateComplaint
            onClose={() => setShowCreateModal(false)}
            onComplaintCreated={handleComplaintCreated}
          />
        )}
      </div>
    </main>
  );
}
