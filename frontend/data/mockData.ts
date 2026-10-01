import {
  CampusUser,
  Complaint,
  Event,
  NotificationItem,
  Post,
  ReportedPost,
  Room,
} from "@/types";

export const mockPosts: Post[] = [
  {
    id: "p1",
    title: "Domino's 2-Medium Pizzas 50% Off Split — Hall 4 Common Room",
    description:
      "Ordering 2 medium cheese burst pizzas (Farmhouse + Peppy Paneer) on the BOGO app coupon. Total bill comes to ₹640 after delivery. Need 2 people to split ₹210 each. ETA 30 mins!",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80",
    hashtags: ["#foodsplit", "#dinner", "#dominos"],
    interactionType: "FOOD_SPLIT",
    author: "Aman Verma",
    authorId: "u1",
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 140 * 60 * 1000).toISOString(), // ~2.3 hours remaining
    status: "ACTIVE",
    orderTotal: 640,
    splitCount: 3,
  },
  {
    id: "p2",
    title: "Airport Shared Cab (Terminal 1 & 2) — Tomorrow Early 5:30 AM",
    description:
      "Booked an Uber XL for early morning flight departures. Leaving strictly from Campus Main Gate at 5:30 AM. Trunk has plenty of luggage room. Splitting fare 4 ways (~₹350 each).",
    image:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=80",
    hashtags: ["#cabsplit", "#airport", "#travel"],
    interactionType: "CAB_SPLIT",
    author: "Priya Sharma",
    authorId: "u2",
    createdAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 15 * 60 * 60 * 1000).toISOString(), // 15 hours
    status: "ACTIVE",
    departureTime: "Tomorrow 5:30 AM",
    pickupLocation: "Main Gate Security Post",
    seatsTotal: 4,
    seatsFilled: 2,
  },
  {
    id: "p3",
    title: "TI-84 Plus CE Color Graphing Calculator (Like New)",
    description:
      "Selling my graphing calculator used only for 1 semester in Linear Algebra & Calc. Rechargeable battery, includes USB transfer cable, slide case, and original packaging. Campus handoff at Central Library.",
    image:
      "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=1000&q=80",
    hashtags: ["#resell", "#stationery", "#engineering"],
    interactionType: "RESELL",
    author: "Rohan Nair",
    authorId: "u3",
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    status: "ACTIVE",
    price: "₹2,800",
    itemCondition: "Like New (Mint Condition)",
    resellStatus: "AVAILABLE",
  },
  {
    id: "p4",
    title: "Lost: Apple AirPods Pro (2nd Gen) in Library 2nd Floor Silent Zone",
    description:
      "Misplaced my white AirPods Pro case with a blue Spigen silicone sleeve on Desk 42, 2nd floor reading hall around 2 PM today. Contains engravings 'AP'. Reward offered if found!",
    image:
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=1000&q=80",
    hashtags: ["#lost", "#electronics", "#library"],
    interactionType: "LOST",
    author: "Sneha Patel",
    authorId: "u4",
    contactName: "Sneha Patel (Room 214, GH-2)",
    contactPhone: "+91 98765 43210",
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    status: "ACTIVE",
  },
  {
    id: "p5",
    title: "Found: Student Institute ID Card + Metallic Cycle Key at Food Court",
    description:
      "Found an ID card belonging to B.Tech ECE 2nd year student along with a silver cycle lock key near the juice bar counter. Handed over to the Food Court Manager / Security Desk.",
    image:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80",
    hashtags: ["#found", "#idcard", "#foodcourt"],
    interactionType: "FOUND",
    author: "Karan Johar",
    authorId: "u5",
    contactName: "Karan / Campus Security Post A",
    contactPhone: "+91 91234 56789",
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    status: "ACTIVE",
  },
  {
    id: "p6",
    title: "Midnight Shawarma & Burger Split — Midnight Kitchen Delivery",
    description:
      "Placing an order at 11:30 PM for 3 chicken shawarmas and loaded fries. Delivery charge is waived on orders above ₹500. Looking for 1 or 2 hostel mates in BH-3 or BH-4.",
    image:
      "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=1000&q=80",
    hashtags: ["#foodsplit", "#midnight", "#snack"],
    interactionType: "FOOD_SPLIT",
    author: "Aditya Roy",
    authorId: "u6",
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 35 * 60 * 1000).toISOString(), // ~35 mins (Warning tier)
    status: "ACTIVE",
    orderTotal: 520,
    splitCount: 2,
  },
  {
    id: "p7",
    title: "Cab Split to Central Railway Station — Today 4:15 PM Departure",
    description:
      "Going to Central Station to catch the 6:00 PM Express. Car leaves right from Hostel 7 circle at 4:15 PM sharp. Need 1 more person to fill the 3rd seat.",
    image:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80",
    hashtags: ["#cabsplit", "#railway", "#weekend"],
    interactionType: "CAB_SPLIT",
    author: "Ananya Deshmukh",
    authorId: "u7",
    createdAt: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 11 * 60 * 1000).toISOString(), // ~11 mins (Urgent tier)
    status: "ACTIVE",
    departureTime: "Today 4:15 PM",
    pickupLocation: "Hostel 7 Roundabout",
    seatsTotal: 3,
    seatsFilled: 2,
  },
  {
    id: "p8",
    title: "Hercules Roadeo 21-Speed Gear Bicycle + Number Lock Included",
    description:
      "Dual suspension mountain bike in solid condition. Both brakes tuned last week. Selling because I am graduating this term. Great for commuting between hostel block and tech lecture halls.",
    image:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80",
    hashtags: ["#resell", "#cycle", "#campuslife"],
    interactionType: "RESELL",
    author: "Vikram Malhotra",
    authorId: "u8",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    status: "ACTIVE",
    price: "₹4,200",
    itemCondition: "Good (Tuned & Ready to Ride)",
    resellStatus: "AVAILABLE",
  },
];

export const mockEvents: Event[] = [
  {
    id: "e1",
    name: "Hackathon 2026: 24h Build Sprint",
    date: "2026-10-14",
    time: "10:00 AM",
    venue: "Auditorium Hall A & Innovation Lab",
    description:
      "Annual inter-college 24-hour hackathon. Build amazing web, mobile, and hardware prototypes with mentorship from top tech leads. Total prize pool ₹1,50,000 + sponsor goodies.",
    createdBy: "Coding Club",
  },
  {
    id: "e2",
    name: "Campus Music & Unplugged Night",
    date: "2026-10-22",
    time: "06:30 PM",
    venue: "Open Air Amphitheatre (OAT)",
    description:
      "Live band showcases, solo acoustic performances, and guest DJ night. Free warm cider and snacks for all verified students with college ID.",
    createdBy: "Cultural Society",
  },
  {
    id: "e3",
    name: "Robotics & Edge-AI Autonomous Rover Workshop",
    date: "2026-11-05",
    time: "02:00 PM",
    venue: "Lab 3, Advanced Tech Building",
    description:
      "Hands-on workshop on programming microcontrollers with lightweight computer vision and PID motor control algorithms. Hardware kits provided for groups of 3.",
    createdBy: "Robotics Club",
  },
  {
    id: "e4",
    name: "Inter-Hostel Badminton & Table Tennis Tournament",
    date: "2026-10-18",
    time: "04:30 PM",
    venue: "Indoor Sports Complex Courts 1-4",
    description:
      "Knockout matches for singles and mixed doubles across all undergraduate and postgraduate hostel wings. Registration closes on Thursday.",
    createdBy: "Sports Committee",
  },
  {
    id: "e5",
    name: "Campus Orientation & Tech Clubs Expo 2026",
    date: "2026-09-10",
    time: "09:30 AM",
    venue: "Student Activity Center (SAC)",
    description:
      "Welcome expo and induction drive for freshers and sophomores to join design, coding, robotics, automotive, and astronomy teams.",
    createdBy: "Student Affairs",
  },
];

export const mockComplaints: Complaint[] = [
  {
    id: "c1",
    title: "Hostel Block 3 Wi-Fi connectivity dropping every 15 minutes",
    description:
      "The Wi-Fi access points on the 2nd and 3rd floors have high packet loss since yesterday evening. Students are unable to submit lab assignments on the university portal.",
    category: "Campus Wi-Fi",
    status: "OPEN",
    createdAt: "2026-09-28T10:15:00Z",
    isOwner: false,
  },
  {
    id: "c2",
    title: "Cafeteria water dispenser filter replacement needed",
    description:
      "The RO water dispenser near the South Wing dining entrance is showing a continuous red filter warning indicator. Needs maintenance check.",
    category: "Mess / Cafeteria",
    status: "OPEN",
    createdAt: "2026-09-27T16:40:00Z",
    isOwner: false,
  },
  {
    id: "c3",
    title: "Library Reading Room B Air Conditioning leaking condensation",
    description:
      "The secondary AC unit above row 4 desks was leaking water on study tables. Reported to campus estate office.",
    category: "Library / Facilities",
    status: "RESOLVED",
    createdAt: "2026-09-20T09:00:00Z",
    resolvedAt: "2026-09-21T12:00:00Z",
    isOwner: false,
  },
  {
    id: "c4",
    title: "Mess 2 Dinner timing cutoff too early during lab exam week",
    description:
      "Students attending 4:00 PM - 7:30 PM lab practicals are arriving right at mess closing time (7:45 PM). Requesting 30-minute extension until 8:15 PM.",
    category: "Mess / Cafeteria",
    status: "OPEN",
    createdAt: "2026-09-26T19:10:00Z",
    isOwner: false,
  },
  {
    id: "c5",
    title: "Broken stairwell light fixture between 3rd and 4th floor LH-2",
    description:
      "Completely dark after 6:30 PM, posing a safety hazard during evening lectures.",
    category: "Hostel",
    status: "RESOLVED",
    createdAt: "2026-09-18T11:20:00Z",
    resolvedAt: "2026-09-19T10:30:00Z",
    isOwner: false,
  },
];

export const mockRooms: Room[] = [
  {
    id: "r1",
    postId: "p1",
    name: "Domino's Pizza Split (Hall 4)",
    creatorId: "u1",
    creatorName: "Aman Verma",
    status: "OPEN",
    interactionType: "FOOD_SPLIT",
    members: ["u1", "u9", "u10"],
    participants: [
      { id: "u1", name: "Aman Verma", role: "Poster (Host)", isOnline: true, isCreator: true },
      { id: "u9", name: "Devansh Mehta", role: "Member", isOnline: true },
      { id: "u10", name: "Tanvi Sharma", role: "Member", isOnline: false },
    ],
  },
  {
    id: "r2",
    postId: "p2",
    name: "Airport Cab Share (Tomorrow 5:30 AM)",
    creatorId: "u2",
    creatorName: "Priya Sharma",
    status: "OPEN",
    interactionType: "CAB_SPLIT",
    members: ["u2", "u11"],
    participants: [
      { id: "u2", name: "Priya Sharma", role: "Poster (Host)", isOnline: true, isCreator: true },
      { id: "u11", name: "Siddharth Rao", role: "Passenger", isOnline: true },
    ],
  },
  {
    id: "r3",
    postId: "p3",
    name: "TI-84 Plus Graphing Calculator — Buyer/Seller Room",
    creatorId: "u3",
    creatorName: "Rohan Nair",
    status: "OPEN",
    interactionType: "RESELL",
    members: ["u3", "u12"],
    resellStatus: "AVAILABLE",
    offers: [
      {
        id: "off1",
        buyerName: "Sahil Khan",
        buyerId: "u12",
        amount: 2500,
        status: "PENDING",
        timestamp: "10m ago",
      },
    ],
    participants: [
      { id: "u3", name: "Rohan Nair", role: "Seller", isOnline: true, isCreator: true },
      { id: "u12", name: "Sahil Khan", role: "Interested Buyer", isOnline: true },
    ],
  },
  {
    id: "r4",
    postId: "p7",
    name: "Station Cab Share (4:15 PM)",
    creatorId: "u7",
    creatorName: "Ananya Deshmukh",
    status: "OPEN",
    interactionType: "CAB_SPLIT",
    members: ["u7", "u13"],
    participants: [
      { id: "u7", name: "Ananya Deshmukh", role: "Poster", isOnline: true, isCreator: true },
      { id: "u13", name: "Gaurav Joshi", role: "Passenger", isOnline: true },
    ],
  },
];

export const mockMessagesByRoom: Record<
  string,
  Array<{
    id: string;
    chatRoomId: string;
    userId: string;
    content: string;
    createdAt: string;
    user: { id: string; name: string };
  }>
> = {
  r1: [
    {
      id: "m1",
      chatRoomId: "r1",
      userId: "u1",
      content: "Hey guys! I have added Farmhouse and Peppy Paneer to cart. The coupon applies properly.",
      createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      user: { id: "u1", name: "Aman Verma" },
    },
    {
      id: "m2",
      chatRoomId: "r1",
      userId: "u9",
      content: "Awesome! I am in Hall 4 Room 204. Can transfer via UPI whenever you order.",
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      user: { id: "u9", name: "Devansh Mehta" },
    },
    {
      id: "m3",
      chatRoomId: "r1",
      userId: "u10",
      content: "Count me in! I love the cheese burst crust. ₹210 each right?",
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      user: { id: "u10", name: "Tanvi Sharma" },
    },
    {
      id: "m4",
      chatRoomId: "r1",
      userId: "u1",
      content: "Yes, exactly ₹210 each. Order placed! Will ping here when the delivery rider reaches the gate.",
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      user: { id: "u1", name: "Aman Verma" },
    },
  ],
  r2: [
    {
      id: "m201",
      chatRoomId: "r2",
      userId: "u2",
      content: "Hi! Leaving strictly at 5:30 AM tomorrow from Main Gate. My flight is at 8:45 AM.",
      createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      user: { id: "u2", name: "Priya Sharma" },
    },
    {
      id: "m202",
      chatRoomId: "r2",
      userId: "u11",
      content: "Perfect timing, mine is at 9:00 AM. I have 1 trolley bag and 1 backpack. That fine for the Uber XL?",
      createdAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
      user: { id: "u11", name: "Siddharth Rao" },
    },
    {
      id: "m203",
      chatRoomId: "r2",
      userId: "u2",
      content: "Plenty of room! We still have 2 seats open if anyone else wants to split.",
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      user: { id: "u2", name: "Priya Sharma" },
    },
  ],
  r3: [
    {
      id: "m301",
      chatRoomId: "r3",
      userId: "u12",
      content: "Hi Rohan! Is the TI-84 Plus CE still available? Would you consider ₹2,500?",
      createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      user: { id: "u12", name: "Sahil Khan" },
    },
    {
      id: "m302",
      chatRoomId: "r3",
      userId: "u3",
      content: "Hey Sahil, yes still available! I can do ₹2,600 if you can collect it from the Central Library lawn this evening.",
      createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      user: { id: "u3", name: "Rohan Nair" },
    },
  ],
  r4: [
    {
      id: "m401",
      chatRoomId: "r4",
      userId: "u7",
      content: "Hey! Leaving for the station at 4:15 PM sharp. Don't be late please!",
      createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
      user: { id: "u7", name: "Ananya Deshmukh" },
    },
    {
      id: "m402",
      chatRoomId: "r4",
      userId: "u13",
      content: "Will be at the roundabout by 4:10 PM with my bag ready.",
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      user: { id: "u13", name: "Gaurav Joshi" },
    },
  ],
};

export const mockNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "New message in #foodsplit room",
    description: "Aman Verma: Order placed! Will ping here when delivery arrives.",
    time: "5m ago",
    unread: true,
    type: "room_message",
    link: "/rooms?postId=p1",
  },
  {
    id: "notif-2",
    title: "Post expiring in 11 minutes",
    description: "Your cab split to Central Railway Station expires soon.",
    time: "10m ago",
    unread: true,
    type: "expiry_approaching",
    link: "/rooms?postId=p7",
  },
  {
    id: "notif-3",
    title: "Offer received on #resell post",
    description: "Sahil Khan submitted an offer of ₹2,500 on your TI-84 Calculator.",
    time: "12m ago",
    unread: true,
    type: "room_message",
    link: "/rooms?postId=p3",
  },
  {
    id: "notif-4",
    title: "New Official Event published",
    description: "Coding Club announced 'Hackathon 2026: 24h Build Sprint'.",
    time: "2h ago",
    unread: false,
    type: "event_alert",
    link: "/events",
  },
  {
    id: "notif-5",
    title: "Complaint resolved",
    description: "Your complaint 'Library AC condensation leakage' was marked resolved.",
    time: "1d ago",
    unread: false,
    type: "complaint_resolved",
    link: "/complaints",
  },
  {
    id: "notif-6",
    title: "Participant joined your room",
    description: "Siddharth Rao joined your Airport Cab Share room.",
    time: "1d ago",
    unread: false,
    type: "participant_joined",
    link: "/rooms?postId=p2",
  },
];

export const mockReportedPosts: ReportedPost[] = [
  {
    id: "rep-1",
    postId: "p1",
    postTitle: "Domino's 2-Medium Pizzas 50% Off Split",
    reportedBy: "Student (Roll 23EE1002)",
    reason: "Suspected duplicate posting in quick succession.",
    createdAt: "2026-09-29T11:15:00Z",
    status: "PENDING",
  },
  {
    id: "rep-2",
    postId: "p8",
    postTitle: "Hercules Roadeo 21-Speed Gear Bicycle",
    reportedBy: "Student (Roll 21ME1045)",
    reason: "Price appears higher than standard secondhand depreciation rate.",
    createdAt: "2026-09-28T14:20:00Z",
    status: "PENDING",
  },
  {
    id: "rep-3",
    postId: "p6",
    postTitle: "Midnight Shawarma & Burger Split",
    reportedBy: "Hostel Warden Office",
    reason: "Query regarding gate delivery policy after midnight curfew.",
    createdAt: "2026-09-27T23:45:00Z",
    status: "PENDING",
  },
  {
    id: "rep-4",
    postId: "p4",
    postTitle: "Lost: Apple AirPods Pro (2nd Gen)",
    reportedBy: "Library Attendant",
    reason: "Item was retrieved and moved to Security Lost & Found locker.",
    createdAt: "2026-09-26T17:00:00Z",
    status: "DISMISSED",
  },
];

export const mockCampusUsers: CampusUser[] = [
  {
    id: "u1",
    rollNumber: "23CS1004",
    name: "Alex Rivera",
    email: "alex.rivera@campusbuzz.test",
    role: "STUDENT",
    status: "ACTIVE",
    joinedDate: "Aug 2023",
  },
  {
    id: "u2",
    rollNumber: "22EC1021",
    name: "Priya Sharma",
    email: "priya.sharma@campusbuzz.test",
    role: "STUDENT",
    status: "ACTIVE",
    joinedDate: "Aug 2022",
  },
  {
    id: "u-club",
    rollNumber: "22CS0012",
    name: "Coding Club Lead",
    email: "codingclub@campusbuzz.test",
    role: "CLUB",
    status: "ACTIVE",
    joinedDate: "Jul 2022",
  },
  {
    id: "u-comm",
    rollNumber: "22AR0045",
    name: "Cultural Society Secretary",
    email: "cultural@campusbuzz.test",
    role: "COMMITTEE",
    status: "ACTIVE",
    joinedDate: "Jul 2022",
  },
  {
    id: "u-admin",
    rollNumber: "ADMIN01",
    name: "Campus System Administrator",
    email: "admin@campusbuzz.test",
    role: "ADMIN",
    status: "ACTIVE",
    joinedDate: "Jan 2020",
  },
  {
    id: "u3",
    rollNumber: "23ME1055",
    name: "Rohan Nair",
    email: "rohan.nair@campusbuzz.test",
    role: "STUDENT",
    status: "ACTIVE",
    joinedDate: "Aug 2023",
  },
  {
    id: "u4",
    rollNumber: "21CS1018",
    name: "Sneha Patel",
    email: "sneha.patel@campusbuzz.test",
    role: "STUDENT",
    status: "ACTIVE",
    joinedDate: "Aug 2021",
  },
  {
    id: "u-susp",
    rollNumber: "23EE9999",
    name: "Flagged Suspicious Account",
    email: "bot_test@campusbuzz.test",
    role: "STUDENT",
    status: "SUSPENDED",
    joinedDate: "Sep 2026",
  },
];