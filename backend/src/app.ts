import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import testRoutes from "./routes/test.routes";
import postRoutes from "./routes/post.routes";
import path from "node:path";
import chatRoutes from "./routes/chat.routes";
import officialPostRoutes from "./routes/official-post.routes";
import eventRoutes from "./routes/event.routes";
import organizationRoutes from "./routes/organization.routes";
import complaintRoutes from "./routes/complaint.routes";
import notificationRoutes from "./routes/notification.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  "/uploads",
  express.static(
    path.resolve(process.cwd(), "uploads"),
  ),
);
app.use("/api/posts", postRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/official", officialPostRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/complaints", complaintRoutes);
app.use(
  "/api/notifications",
  notificationRoutes,
);

interface ComplaintItem {
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "RESOLVED";
  createdAt: string;
}

let complaints: ComplaintItem[] = [
  {
    id: "c1",
    title: "Hostel Block 3 Wi-Fi connectivity down",
    description: "The Wi-Fi access points on the 2nd and 3rd floors have been intermittent since yesterday evening.",
    status: "OPEN",
    createdAt: new Date().toISOString(),
  },
  {
    id: "c2",
    title: "Cafeteria water dispenser filter replacement",
    description: "Water dispenser near the cafeteria entrance is showing a red filter replacement warning light.",
    status: "OPEN",
    createdAt: new Date().toISOString(),
  },
];

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Campus Buzz API is running" });
});

// Auth & Test Routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);

// ========================
// COMPLAINTS API
// ========================
app.get("/api/complaints", (_req, res) => {
  res.json(complaints);
});

app.post("/api/complaints", (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required." });
  }

  const newComplaint: ComplaintItem = {
    id: `c_${Date.now()}`,
    title: String(title).trim(),
    description: String(description).trim(),
    status: "OPEN",
    createdAt: new Date().toISOString(),
  };

  complaints = [newComplaint, ...complaints];
  res.status(201).json(newComplaint);
});

app.patch("/api/complaints/:id/resolve", (req, res) => {
  const { id } = req.params;
  const complaint = complaints.find((c) => c.id === id);
  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found." });
  }

  complaint.status = "RESOLVED";
  res.json(complaint);
});

export default app;