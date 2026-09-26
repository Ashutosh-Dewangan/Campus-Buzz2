"use client";

import { useCallback, useEffect, useState } from "react";
import ComplaintCard from "@/components/complaints/ComplaintCard";
import CreateComplaint from "@/components/complaints/CreateComplaint";
import { Complaint } from "@/types";
import { getComplaints, resolveComplaint } from "@/lib/api";
import { isAdmin } from "@/lib/auth";
import { useCurrentUser } from "@/lib/session";

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");
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
          c.id === id ? { ...c, status: "RESOLVED" as const } : c
        )
      );
      setResolveMessage("Complaint marked as resolved.");
      setTimeout(() => setResolveMessage(""), 3000);
    } catch (err) {
      console.error("Error resolving complaint:", err);
      setResolveMessage("Failed to mark complaint as resolved.");
      setTimeout(() => setResolveMessage(""), 3000);
    }
  }

  function handleComplaintCreated(newComplaint: Complaint) {
    setComplaints((current) => [newComplaint, ...current]);
    setShowCreateModal(false);
  }

  const filteredComplaints =
    filter === "ALL"
      ? complaints
      : complaints.filter((c) => c.status === filter);

  return (
    <main className="comic-page">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="comic-title">Complaints &amp; Feedback</h1>
            <p className="comic-sub">
              Submit anonymous issues about hostel, library, internet and campus facilities.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="comic-btn"
          >
            + File Complaint
          </button>
        </div>

        {/* Resolve success message */}
        {resolveMessage && (
          <div
            className="mb-4 rounded-sm border-2 border-black px-4 py-3 text-sm font-semibold"
            style={{ background: "rgba(0,229,200,0.12)", color: "var(--tag-found)" }}
          >
            {resolveMessage}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {(["ALL", "OPEN", "RESOLVED"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`filter-pill${filter === tab ? " filter-pill--active" : ""}`}
            >
              {tab === "ALL" ? "All Complaints" : tab === "OPEN" ? "Open Issues" : "Resolved"}
            </button>
          ))}
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
              className="comic-btn mt-4"
            >
              Try again
            </button>
          </div>
        )}

        {/* Complaints Grid */}
        {!isLoading && !error && filteredComplaints.length === 0 ? (
          <div className="comic-card comic-empty">
            <h2 className="stay-loop-title">No complaints found</h2>
            <p className="comic-sub mx-auto max-w-md">
              {filter === "OPEN"
                ? "Great — no open issues right now."
                : filter === "RESOLVED"
                ? "No resolved complaints in this view."
                : "No complaints have been filed yet."}
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
