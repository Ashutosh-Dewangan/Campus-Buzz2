import { Complaint, Event, OfficialPost, Post } from "@/types";

export const mockPosts: Post[] = [
  {
    id: "1",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
    title: "Pizza order tonight",
    description:
      "Ordering pizza from Domino's around 8 PM. Anyone interested in splitting?",
    hashtag: "#foodsplit",
    author: "Rahul",
    createdAt: "2026-09-01T14:00:00",
    expiresAt: "2026-09-02T14:00:00",
  },
  {
    id: "2",
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d",
    title: "Cab to railway station",
    description:
      "Leaving campus for the railway station at 6 PM. Looking for 2-3 people to split the fare.",
    hashtag: "#cabsplit",
    author: "Priya",
    createdAt: "2026-09-01T13:00:00",
    expiresAt: "2026-09-01T18:00:00",
  },
  {
    id: "3",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    title: "Selling my old watch",
    description:
      "Barely used watch. DM if interested. Negotiation can happen in person.",
    hashtag: "#resell",
    author: "Aman",
    createdAt: "2026-09-01T11:00:00",
  },
  {
    id: "4",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
    title: "Lost black backpack",
    description:
      "Lost near the library yesterday evening. Contains a notebook and charger.",
    hashtag: "#lost",
    author: "Neha",
    contact: "neha@example.com",
    createdAt: "2026-09-01T09:00:00",
  },
  {
    id: "5",
    image:
      "https://images.unsplash.com/photo-1577702312708-7c1c4a3b6f4e",
    title: "Found water bottle",
    description:
      "Found a blue water bottle near Block B. Contact me to collect it.",
    hashtag: "#found",
    author: "Vikram",
    contact: "vikram@example.com",
    createdAt: "2026-09-01T08:00:00",
  },
];

export const mockEvents: Event[] = [
  {
    id: "e1",
    name: "Hackathon 2026",
    date: "Sept 15, 2026",
    time: "10:00 AM - 8:00 PM",
    venue: "Auditorium Hall A",
    description:
      "Annual inter-college 24-hour hackathon. Build amazing web and mobile apps with mentorship from industry experts.",
    createdBy: "Coding Club",
  },
  {
    id: "e2",
    name: "Campus Music Night",
    date: "Sept 20, 2026",
    time: "6:30 PM Onwards",
    venue: "Open Air Theatre",
    description:
      "Live band performances, solo vocal showdowns, and DJ night. Free refreshments for all students with valid ID.",
    createdBy: "Cultural Society",
  },
  {
    id: "e3",
    name: "Robotics & AI Workshop",
    date: "Sept 25, 2026",
    time: "2:00 PM - 5:00 PM",
    venue: "Lab 3, Tech Building",
    description:
      "Hands-on workshop on building autonomous line-follower robots and introduction to edge AI computer vision.",
    createdBy: "Robotics Club",
  },
];

export const mockComplaints: Complaint[] = [
  {
    id: "c1",
    title: "Hostel Block 3 Wi-Fi connectivity down",
    description:
      "The Wi-Fi access points on the 2nd and 3rd floors have been intermittent since yesterday evening. Students are unable to submit assignments.",
    status: "OPEN",
    createdAt: "2026-09-01T10:15:00",
  },
  {
    id: "c2",
    title: "Cafeteria water dispenser filter replacement",
    description:
      "Water dispenser near the cafeteria entrance is showing a red filter replacement warning light.",
    status: "OPEN",
    createdAt: "2026-08-31T16:40:00",
  },
  {
    id: "c3",
    title: "Library reading room AC repaired",
    description:
      "The AC in reading hall B was leaking water. Maintenance resolved it today.",
    status: "RESOLVED",
    createdAt: "2026-08-28T09:00:00",
  },
];

export const mockOfficialPosts: OfficialPost[] = [
  {
    id: "o1",
    organization: "Placement Cell",
    content:
      "Registration for Google Campus Recruitment Drive is now live. All final year B.Tech and M.Tech students are eligible. Please submit your resumes via the link below before the deadline.",
    formUrl: "https://forms.google.com/example-placement-drive",
    eventName: "Campus Placement Drive 2026",
    createdAt: "2026-09-01T09:00:00",
  },
  {
    id: "o2",
    organization: "Student Council",
    content:
      "Nominations are now open for Class Representatives and Club Leads for the upcoming academic year. Submit your application form by Friday.",
    formUrl: "https://forms.google.com/council-elections-2026",
    eventName: "Annual Council Elections",
    createdAt: "2026-08-30T14:30:00",
  },
  {
    id: "o3",
    organization: "Dean of Student Affairs",
    content:
      "Campus library hours have been extended to 11:00 PM for the upcoming mid-term examinations. All students are advised to carry their ID cards at all times.",
    createdAt: "2026-08-29T11:00:00",
  },
];