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
    <main className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Complaints & Feedback</h1>
          <p className="mt-1 text-sm text-gray-500">
            Submit anonymous issues regarding hostel, library, internet, and campus facilities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Admin Role Toggle to test resolve capability */}
          <label className="flex items-center gap-2 rounded-xl border bg-white px-3.5 py-2.5 text-xs font-medium text-gray-700 shadow-sm cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={canResolve}
              onChange={(e) => setCanResolve(e.target.checked)}
              className="rounded"
            />
            <span>Admin / Resolver View</span>
          </label>

          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 shadow-sm cursor-pointer"
          >
            + File Complaint
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2">
        {(["ALL", "OPEN", "RESOLVED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition cursor-pointer ${
              filter === tab
                ? "bg-black text-white"
                : "bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-100"
            }`}
          >
            {tab === "ALL" ? "All Complaints" : tab === "OPEN" ? "Open Issues" : "Resolved"}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="mb-4 text-sm text-gray-500">Refreshing complaints from server...</div>
      )}

      {/* Complaints Grid */}
      {filteredComplaints.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <h2 className="text-lg font-semibold text-gray-900">No complaints found</h2>
          <p className="mt-2 text-sm text-gray-500">
            {filter === "OPEN"
              ? "Great news! There are no open issues."
              : "No complaints in this category."}
          </p>
        </div>
      ) : (
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
      )}

      {/* Create Complaint Modal */}
      {showCreateModal && (
        <CreateComplaint
          onClose={() => setShowCreateModal(false)}
          onComplaintCreated={handleComplaintCreated}
        />
      )}
    </main>
  );
}
