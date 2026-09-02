import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import testRoutes from "./routes/test.routes";
import postRoutes from "./routes/post.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/posts", postRoutes);

interface EventItem {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  createdBy: string;
}

interface ComplaintItem {
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "RESOLVED";
  createdAt: string;
}

interface OfficialPostItem {
  id: string;
  organization: string;
  content: string;
  formUrl?: string;
  eventName?: string;
  createdAt: string;
}

let events: EventItem[] = [
  {
    id: "e1",
    name: "Hackathon 2026",
    date: "Sept 15, 2026",
    time: "10:00 AM - 8:00 PM",
    venue: "Auditorium Hall A",
    description: "Annual inter-college 24-hour hackathon. Build amazing web and mobile apps with mentorship from industry experts.",
    createdBy: "Coding Club",
  },
  {
    id: "e2",
    name: "Campus Music Night",
    date: "Sept 20, 2026",
    time: "6:30 PM Onwards",
    venue: "Open Air Theatre",
    description: "Live band performances, solo vocal showdowns, and DJ night. Free refreshments for all students with valid ID.",
    createdBy: "Cultural Society",
  },
];

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

let officialPosts: OfficialPostItem[] = [
  {
    id: "o1",
    organization: "Placement Cell",
    content: "Registration for Google Campus Recruitment Drive is now live. All final year students are eligible.",
    formUrl: "https://forms.google.com/example-placement-drive",
    eventName: "Campus Placement Drive 2026",
    createdAt: new Date().toISOString(),
  },
  {
    id: "o2",
    organization: "Dean of Student Affairs",
    content: "Campus library hours have been extended to 11:00 PM for the upcoming mid-term examinations.",
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
// EVENTS API
// ========================
app.get("/api/events", (_req, res) => {
  res.json(events);
});

app.post("/api/events", (req, res) => {
  const { name, date, time, venue, description, createdBy } = req.body;
  if (!name || !date || !time || !venue || !description) {
    return res.status(400).json({ error: "All event fields are required." });
  }

  const newEvent: EventItem = {
    id: `e_${Date.now()}`,
    name: String(name).trim(),
    date: String(date).trim(),
    time: String(time).trim(),
    venue: String(venue).trim(),
    description: String(description).trim(),
    createdBy: createdBy ? String(createdBy).trim() : "Campus Student",
  };

  events = [newEvent, ...events];
  res.status(201).json(newEvent);
});

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

// ========================
// OFFICIAL POSTS API
// ========================
app.get("/api/official", (_req, res) => {
  res.json(officialPosts);
});

app.post("/api/official", (req, res) => {
  const { organization, content, formUrl, eventName } = req.body;
  if (!organization || !content) {
    return res.status(400).json({ error: "Organization and content are required." });
  }

  const newOfficialPost: OfficialPostItem = {
    id: `o_${Date.now()}`,
    organization: String(organization).trim(),
    content: String(content).trim(),
    formUrl: formUrl ? String(formUrl).trim() : undefined,
    eventName: eventName ? String(eventName).trim() : undefined,
    createdAt: new Date().toISOString(),
  };

  officialPosts = [newOfficialPost, ...officialPosts];
  res.status(201).json(newOfficialPost);
});

export default app;