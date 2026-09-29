import { Complaint, ComplaintCategory } from "@/types";
import { getStoredComplaints, saveStoredComplaints } from "./storage";
import { getSession } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getAuthHeaders(): HeadersInit {
  const session = getSession();
  if (!session?.token) return {};
  return { Authorization: `Bearer ${session.token}` };
}

export async function getComplaints(): Promise<Complaint[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${API_URL}/api/complaints`, {
      headers: { ...getAuthHeaders() },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // Offline fallback
  }

  return getStoredComplaints();
}

export async function createComplaint(complaint: {
  title: string;
  description: string;
  category?: ComplaintCategory;
}): Promise<Complaint> {
  const session = getSession();
  const userId = session?.user?.id || "u-current";
  const studentRoll = session?.user?.rollNumber || "23CS1004";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(`${API_URL}/api/complaints`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ ...complaint, userId, studentRoll }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (response.ok) {
      const created = await response.json();
      const current = getStoredComplaints();
      saveStoredComplaints([created, ...current]);
      return created;
    }
  } catch {
    // Offline fallback
  }

  const newComplaint: Complaint = {
    id: `c-${Date.now()}`,
    title: complaint.title,
    description: complaint.description,
    category: complaint.category || "Other",
    createdAt: new Date().toISOString(),
    status: "OPEN",
    userId,
    studentRoll,
  };

  const current = getStoredComplaints();
  saveStoredComplaints([newComplaint, ...current]);
  return newComplaint;
}

export async function resolveComplaint(id: string): Promise<Complaint> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(
      `${API_URL}/api/complaints/${encodeURIComponent(id)}/resolve`,
      {
        method: "PATCH",
        headers: { ...getAuthHeaders() },
        signal: controller.signal,
      }
    ).finally(() => clearTimeout(timeoutId));

    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Offline fallback
  }

  const current = getStoredComplaints();
  const index = current.findIndex((c) => c.id === id);
  if (index >= 0) {
    current[index].status = "RESOLVED";
    current[index].resolved = true;
    saveStoredComplaints(current);
    return current[index];
  }

  return {
    id,
    title: "Complaint",
    description: "",
    status: "RESOLVED",
    resolved: true,
    createdAt: new Date().toISOString(),
  };
}
