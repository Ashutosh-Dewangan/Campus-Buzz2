import express from "express";
import cors from "cors";
import multer from "multer";

const upload = multer();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

interface PostItem {
  id: string;
  image: string;
  title: string;
  description: string;
  hashtag: string;
  author: string;
  contact?: string;
  createdAt: string;
  expiresAt?: string;
}

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

// In-memory data store with initial seed
let posts: PostItem[] = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
    title: "Pizza order tonight",
    description: "Ordering pizza from Domino's around 8 PM. Anyone interested in splitting?",
    hashtag: "#foodsplit",
    author: "Rahul",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d",
    title: "Cab to railway station",
    description: "Leaving campus for the railway station at 6 PM. Looking for 2-3 people to split the fare.",
    hashtag: "#cabsplit",
    author: "Priya",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    title: "Selling my old watch",
    description: "Barely used watch. DM if interested. Negotiation can happen in person.",
    hashtag: "#resell",
    author: "Aman",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
    title: "Lost black backpack",
    description: "Lost near the library yesterday evening. Contains a notebook and charger.",
    hashtag: "#lost",
    author: "Neha",
    contact: "neha@example.com",
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1577702312708-7c1c4a3b6f4e",
    title: "Found water bottle",
    description: "Found a blue water bottle near Block B. Contact me to collect it.",
    hashtag: "#found",
    author: "Vikram",
    contact: "vikram@example.com",
    createdAt: new Date().toISOString(),
  },
];

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

// ========================
// STAGE 5: POSTS API
// ========================
app.get("/api/posts", (_req, res) => {
  res.json(posts);
});

app.post("/api/posts", upload.any(), (req, res) => {
  const { title, description, hashtag, expiry, author, contact } = req.body;

  // Validation
  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "Title is required." });
  }

  if (!description || typeof description !== "string" || !description.trim()) {
    return res.status(400).json({ error: "Description is required." });
  }

  if (!hashtag || typeof hashtag !== "string" || !hashtag.trim()) {
    return res.status(400).json({ error: "Hashtag is required." });
  }

  const validHashtags = ["#foodsplit", "#cabsplit", "#resell", "#lost", "#found"];
  if (!validHashtags.includes(hashtag.trim())) {
    return res.status(400).json({ error: "Invalid hashtag." });
  }

  let expiresAt: string | undefined = undefined;
  if (expiry && !isNaN(Number(expiry))) {
    const hours = Number(expiry);
    expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  }

  // Default placeholder images by category
  const imageMap: Record<string, string> = {
    "#foodsplit": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
    "#cabsplit": "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d",
    "#resell": "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    "#lost": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
    "#found": "https://images.unsplash.com/photo-1577702312708-7c1c4a3b6f4e",
  };

  const newPost: PostItem = {
    id: Date.now().toString(),
    title: title.trim(),
    description: description.trim(),
    hashtag: hashtag.trim(),
    image: imageMap[hashtag.trim()] || "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
    author: author ? String(author).trim() : "You",
    contact: contact ? String(contact).trim() : undefined,
    createdAt: new Date().toISOString(),
    expiresAt,
  };

  posts = [newPost, ...posts];
  res.status(201).json(newPost);
});

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
