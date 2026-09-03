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
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Complaints & Feedback
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Submit anonymous issues regarding hostel, library, internet, and campus facilities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Admin Role Toggle to test resolve capability */}
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">
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
              className="cursor-pointer rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
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
              className={`cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                filter === tab
                  ? "bg-black text-white shadow-sm"
                  : "bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-100"
              }`}
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
                className="h-52 animate-pulse rounded-2xl border bg-white shadow-sm"
              />
            ))}
          </div>
        )}

        {/* Complaints Grid */}
        {!isLoading && filteredComplaints.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center sm:p-14">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
              📢
            </div>
            <h2 className="mt-5 text-lg font-semibold text-gray-900">
              No complaints found
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
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
