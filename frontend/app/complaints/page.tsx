"use client";

import { useEffect, useState } from "react";
import ComplaintCard from "@/components/complaints/ComplaintCard";
import CreateComplaint from "@/components/complaints/CreateComplaint";
import { mockComplaints } from "@/data/mockData";
import { Complaint } from "@/types";
import { getComplaints, resolveComplaint } from "@/lib/api";

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>(mockComplaints);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [canResolve, setCanResolve] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadComplaints() {
      setIsLoading(true);
      try {
        const fetched = await getComplaints();
        if (Array.isArray(fetched) && fetched.length > 0) {
          setComplaints(fetched);
        }
      } catch (err) {
        console.warn("Backend API unavailable, using mock complaints fallback:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadComplaints();
  }, []);

  async function handleResolve(id: string) {
    try {
      try {
        await resolveComplaint(id);
      } catch {
        // Fallback for offline mode
      }

      setComplaints((current) =>
        current.map((c) =>
          c.id === id ? { ...c, status: "RESOLVED" } : c
        )
      );
      alert("Complaint marked as resolved!");
    } catch (err) {
      console.error("Error resolving complaint:", err);
    }
  }

  function handleComplaintCreated(newComplaint: Complaint) {
    setComplaints((current) => [newComplaint, ...current]);
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
            <h1 className="comic-title">Complaints & Feedback</h1>
            <p className="comic-sub">
              Submit anonymous issues regarding hostel, library, internet, and campus facilities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="comic-card flex cursor-pointer items-center gap-2 px-3.5 py-2.5 text-xs font-medium">
              <input
                type="checkbox"
                checked={canResolve}
                onChange={(e) => setCanResolve(e.target.checked)}
                className="rounded text-black focus:ring-black"
              />
              <span>Admin / Resolver View</span>
            </label>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="comic-btn"
            >
              + File Complaint
            </button>
          </div>
        </div>

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

        {/* Complaints Grid */}
        {!isLoading && filteredComplaints.length === 0 ? (
          <div className="comic-card comic-empty">
            <h2 className="stay-loop-title">No complaints found</h2>
            <p className="comic-sub mx-auto max-w-md">
              {filter === "OPEN"
                ? "Great news! There are no open issues."
                : "No complaints in this category."}
            </p>
          </div>
        ) : (
          !isLoading && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredComplaints.map((complaint) => (
                <ComplaintCard
                  key={complaint.id}
                  complaint={complaint}
                  canResolve={canResolve}
                  onResolve={handleResolve}
                />
              ))}
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
