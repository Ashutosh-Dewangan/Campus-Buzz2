import { CampusUser, ReportedPost } from "@/types";
import {
  getStoredComplaints,
  getStoredEvents,
  getStoredPosts,
  getStoredReports,
  getStoredRooms,
  getStoredUsers,
  saveStoredPosts,
  saveStoredReports,
  saveStoredUsers,
} from "./storage";

export interface AdminStats {
  totalUsers: number;
  activeRooms: number;
  openComplaints: number;
  pendingReports: number;
  upcomingEvents: number;
  totalPosts: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const users = getStoredUsers();
  const rooms = getStoredRooms();
  const complaints = getStoredComplaints();
  const reports = getStoredReports();
  const events = getStoredEvents();
  const posts = getStoredPosts();

  const now = new Date();

  return {
    totalUsers: users.length,
    activeRooms: rooms.filter((r) => r.status === "OPEN").length,
    openComplaints: complaints.filter((c) => c.status === "OPEN").length,
    pendingReports: reports.filter((r) => r.status === "PENDING").length,
    upcomingEvents: events.filter((e) => {
      const d = new Date(e.date);
      return Number.isNaN(d.getTime()) ? true : d >= now;
    }).length,
    totalPosts: posts.length,
  };
}

export async function getReportedPosts(): Promise<ReportedPost[]> {
  return getStoredReports();
}

export async function dismissReport(reportId: string): Promise<void> {
  const reports = getStoredReports();
  const rep = reports.find((r) => r.id === reportId);
  if (rep) {
    rep.status = "DISMISSED";
    saveStoredReports(reports);
  }
}

export async function removePost(reportId: string, postId: string): Promise<void> {
  // Update report
  const reports = getStoredReports();
  const rep = reports.find((r) => r.id === reportId);
  if (rep) {
    rep.status = "RESOLVED";
    saveStoredReports(reports);
  }

  // Remove or close post
  const posts = getStoredPosts();
  const p = posts.find((item) => item.id === postId);
  if (p) {
    p.status = "CLOSED";
    saveStoredPosts(posts);
  }
}

export async function getUsers(): Promise<CampusUser[]> {
  return getStoredUsers();
}

export async function toggleUserStatus(userId: string): Promise<CampusUser | null> {
  const users = getStoredUsers();
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.status = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    saveStoredUsers(users);
    return user;
  }
  return null;
}
