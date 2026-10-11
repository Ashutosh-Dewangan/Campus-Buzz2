# Campus Buzz 2

A campus social platform that combines a short-lived **peer-coordination feed** (food splits, cab splits, resale, lost & found), **real-time chat rooms**, **official club/committee announcements**, a **campus events calendar**, and a **complaints board**, built as a Next.js frontend and an Express + Prisma + PostgreSQL backend.

> **Project status:** work in progress. The backend API is substantially complete. The frontend is wired to it for most features, but the admin dashboard still runs on mock data, and a few features are placeholders. See [Implementation status](#implementation-status).

---

## Table of contents

- [Features](#features)
- [Implementation status](#implementation-status)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Repository structure](#repository-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Authentication and authorization](#authentication-and-authorization)
- [API reference](#api-reference)
- [Real-time events](#real-time-events)
- [Data model](#data-model)
- [Background jobs](#background-jobs)
- [Testing and quality checks](#testing-and-quality-checks)
- [Known limitations and security notes](#known-limitations-and-security-notes)
- [Contributing](#contributing)
- [Team](#team)
- [License](#license)

---

## Features

**Campus Buzz feed** (`/`, `/buzz`)
- Students publish image posts tagged with exactly one *interaction hashtag*: `#foodsplit`, `#cabsplit`, `#resell`, `#lost`, or `#found` (plus up to two more hashtags, three in total).
- Image upload is required: PNG or JPEG, up to 5 MB, validated by MIME type **and** file signature (magic bytes).
- `#foodsplit` and `#cabsplit` posts expire (default 24 hours; custom expiry between 10 minutes and 2 days). Expired posts are hidden from the feed and closed automatically.
- `#resell`, `#lost` and `#found` posts require a contact name and phone, which are **not** included in the feed payload. They are fetched on demand through a separate authenticated endpoint.
- A "Campus Pulse" panel shows counts of active posts per category.

**Coordination rooms** (`/rooms`, `/rooms/[id]`, also reachable as `/chat/[id]`)
- A chat room is created automatically for `#foodsplit`, `#cabsplit` and `#resell` posts.
- Users join and leave rooms, read history, and send messages (max 1000 characters). Messages are saved through the REST API and broadcast to room members over Socket.IO.
- The post author can close a room. Rooms also close automatically when the post expires.

**Notifications**
- Persisted per user and pushed live over Socket.IO. Types currently generated: new room message, participant joined, post expiring soon (30 min and 5 min reminders), and complaint resolved.
- List, mark one read, and mark all read.

**Official Campus** (`/official`) and **Campus Calendar** (`/official/calendar`)
- Admins and active members of a club/committee publish official announcements (title, content, optional link, optional form URL).
- Events (name, date, time, venue, description) can be linked to an official post. Date and time are interpreted as India Standard Time (`+05:30`).

**Complaints** (`/complaints`)
- Students file complaints with a category (`HOSTEL`, `MESS_CAFETERIA`, `CAMPUS_WIFI`, `LIBRARY_FACILITIES`, `ACADEMIC`, `OTHER`).
- All signed-in users can see the list, but poster identity (name, roll number, email) is only returned to admins. The poster or an admin can mark a complaint resolved, which notifies the poster.

---

## Implementation status

Assessed from reading the source. The backend and frontend were typechecked (see [Testing](#testing-and-quality-checks)), but the application was **not run end to end** against a live database.

| Area | Status | Notes |
|---|---|---|
| Login (roll number + institute email) | Implemented, **no password check** | See [security notes](#known-limitations-and-security-notes). |
| Campus Buzz posts, image upload, hashtags | Implemented | Backend and frontend both call the real API. |
| Post expiry and expiry reminders | Implemented | Interval jobs, run every 60 s. |
| Chat rooms (REST + Socket.IO) | Implemented | Messages are sent via REST, delivered via socket. |
| Notifications | Implemented | `EVENT_ALERT` type exists in the enum but nothing creates it yet. |
| Official posts | Implemented | Create, list and delete. No edit endpoint. |
| Events and calendar | Implemented | Create, list, update and delete. |
| Complaints | Implemented | Create, list and resolve. |
| Organizations | Partially implemented | Read-only list endpoint. No create/join/membership API. Orgs and memberships come from the seed script or direct DB access. |
| **Admin dashboard** (`/admin`) | **UI-only / mock data** | Stats, reported posts and user lists are read from `localStorage`, seeded from `frontend/data/mockData.ts`. There is no backend admin or reporting API. |
| **Resell price negotiation / offers** | **Not implemented** | The frontend functions throw "not supported by the current server". |
| Room list endpoint | Not implemented | The rooms page derives its list from the posts feed. |
| Demo persona switcher (login page) | Frontend-only | Sets a fake `mock-demo-token-*` token. The backend rejects it, so API-backed pages fail. It is only useful for the mock-driven admin UI. |
| User registration / password reset | Not implemented | Users are created through the seed script or the database. |
| Automated tests | Not found | No test files or test runner configured. |
| Docker / CI / deployment config | Not found | Nothing in the repository. |

---

## Tech stack

| Layer | Technology (versions from `package.json`) |
|---|---|
| Frontend | Next.js `16.3.3` (App Router), React `19.2.8`, Tailwind CSS `4`, TypeScript `5`, `socket.io-client` `^4.8.4` |
| Backend | Node.js, Express `^5.2.1`, TypeScript `^5.9.2`, Socket.IO `^4.8.4`, Zod `^4.5.4`, Multer `^2.3.0`, `jsonwebtoken` `^9.0.3`, `cors` |
| Database | PostgreSQL via Prisma `^7.10.0` with the `@prisma/adapter-pg` driver adapter |
| Dev tooling | `tsx` (backend dev runner and seed), ESLint 9 with `eslint-config-next` (frontend) |

---

## Architecture

```mermaid
flowchart LR
  subgraph Browser
    FE[Next.js app<br/>localStorage session]
  end
  subgraph Backend[Express + Socket.IO, port 5000]
    R[Routes] --> C[Controllers] --> S[Services]
    J[Interval jobs<br/>expiry + reminders]
    IO[Socket.IO server]
    UP[(uploads/ on local disk)]
  end
  DB[(PostgreSQL)]
  FE -- "REST /api/* (Bearer JWT)" --> R
  FE <-- "WebSocket (JWT in handshake)" --> IO
  S --> DB
  J --> DB
  S --> IO
  S --> UP
  FE -- "GET /uploads/*" --> UP
```

- Backend layering: `routes` → `controllers` (input parsing, status codes) → `services` (business logic, Prisma). Request validation uses Zod schemas in `validators/`.
- Uploaded images are written to `backend/uploads/` on local disk and served statically at `/uploads/*`. The directory is git-ignored except for `.gitkeep`, so this needs persistent storage if deployed.
- The Prisma client is generated into `backend/src/generated/prisma` and is committed to the repository.

---

## Repository structure

```
Campus-Buzz2/
├── package.json              # root: only a tsx devDependency
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/       # 8 migrations
│   ├── prisma7.config.ts     # Prisma CLI config (reads DATABASE_URL)
│   ├── src/
│   │   ├── server.ts         # HTTP + Socket.IO bootstrap, starts jobs
│   │   ├── app.ts            # Express app, CORS, route mounting, upload error handler
│   │   ├── config.ts         # required/optional env vars
│   │   ├── socket.ts         # Socket.IO auth + room events
│   │   ├── routes/ controllers/ services/ validators/ middleware/
│   │   ├── jobs/             # post-expiry.job.ts, expiry-reminder.job.ts
│   │   ├── seed.ts           # development seed data
│   │   └── generated/prisma/ # generated Prisma client
│   └── uploads/              # runtime image storage
└── frontend/
    ├── app/                  # pages: buzz, rooms, events, complaints, official, admin, login
    ├── components/           # buzz, rooms, events, complaints, official, layout, notifications
    ├── lib/                  # api/*, session.ts, socket.ts, auth helpers
    ├── data/mockData.ts      # mock data used by the admin dashboard
    ├── next.config.ts        # rewrites: /chat/:id → /rooms/:id, /buzz/:id → /buzz
    └── proxy.ts              # guards malformed /rooms/:id URLs
```

The `.claude/`, `.windsurf/` and `.agents/` folders under `backend/` hold AI-assistant Prisma skill files and are not part of the application.

---

## Getting started

### Prerequisites

- Node.js and npm. The repository does not pin a version. The checks described below ran on Node 22, and Next.js 16 and Prisma 7 require a recent Node release, so check their docs for the exact minimum.
- A running PostgreSQL database.

### 1. Clone and set up the backend

```bash
git clone https://github.com/Ashutosh-Dewangan/Campus-Buzz2.git
cd Campus-Buzz2/backend
npm install
```

Create `backend/.env` (see [Environment variables](#environment-variables)):

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/campus_buzz
JWT_SECRET=replace-with-a-long-random-string
```

Apply migrations and seed development data. The Prisma config file is named `prisma7.config.ts` rather than the default name, so pass it explicitly:

```bash
npx prisma migrate deploy --config prisma7.config.ts
npm run seed
npm run dev
```

> The `prisma` commands above were not executed during documentation. If a command fails, check the Prisma 7 CLI docs for `--config`. The client in `src/generated/prisma` is already committed, but you can regenerate it with `npx prisma generate --config prisma7.config.ts` after schema changes.

The API listens on `http://localhost:5000` by default. Check it with:

```bash
curl http://localhost:5000/api/health
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. If the backend is not on `http://localhost:5000`, set `NEXT_PUBLIC_API_URL` in `frontend/.env.local`.

### 3. Sign in with seeded accounts

`npm run seed` creates these development users (`backend/src/seed.ts`):

| Role | Roll number | Institute email |
|---|---|---|
| STUDENT | `STUDENT001` | `student@campusbuzz.test` |
| STUDENT | `STUDENT002` | `student2@campusbuzz.test` |
| ADMIN | `ADMIN001` | `admin@campusbuzz.test` |

It also creates one organization ("Robotics Club") and gives `STUDENT001` an active membership, so that account can publish official posts and events for that club. Login requires only roll number and email (no password).

Note that the login page's **"Quick Persona Switcher"** uses different fake identities and a mock token. It does not authenticate against the backend.

---

## Environment variables

Only the variables below are read by the code.

| Variable | Where | Required | Default | Purpose |
|---|---|---|---|---|
| `DATABASE_URL` | backend | **Yes** | none | PostgreSQL connection string (server and Prisma CLI) |
| `JWT_SECRET` | backend | **Yes** | none | Signs and verifies JWTs for HTTP and Socket.IO |
| `PORT` | backend | No | `5000` | HTTP port |
| `CORS_ORIGIN` | backend | No | `http://localhost:3000` | Comma-separated allowed origins (REST and Socket.IO) |
| `NEXT_PUBLIC_API_URL` | frontend | No | `http://localhost:5000` | Backend base URL for REST, uploads and sockets |

The server exits at startup if `DATABASE_URL` or `JWT_SECRET` is missing. No `.env.example` is provided.

---

## Scripts

**Backend** (`backend/package.json`)

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `tsx watch src/server.ts` | Dev server with reload |
| `npm run build` | `tsc -p tsconfig.build.json` | Compile to `dist/` |
| `npm start` | `node dist/server.js` | Run compiled server |
| `npm run seed` | `tsx src/seed.ts` | Insert development data |

**Frontend** (`frontend/package.json`)

| Script | Command |
|---|---|
| `npm run dev` | `next dev` |
| `npm run build` | `next build` |
| `npm start` | `next start` |
| `npm run lint` | `eslint` |

---

## Authentication and authorization

- **Login:** `POST /api/auth/login` with `{ rollNumber, instituteEmail }`. On a match, the server returns a JWT (payload `userId`, `role`; expires in **7 days**) and the user's profile with active memberships.
- **HTTP:** all routes except `/api/health` and `/api/auth/login` require `Authorization: Bearer <token>`.
- **Sockets:** the JWT is passed as `auth.token` in the Socket.IO handshake. Connections without a valid token are rejected.
- **Platform roles:** `STUDENT` and `ADMIN` (enum `PlatformRole`). Club and committee status is modelled through `Membership` records, not roles.
- **Rules enforced by the backend:**

| Action | Who |
|---|---|
| Create Campus Buzz post | `STUDENT` role only (admins are rejected with 403) |
| Create official post | Admin, or active member of the target organization |
| Delete official post | Admin, or active member of the post's organization |
| Create event | Admin, or active member of the given organization (students must supply `organizationId`) |
| Update/delete event | Admin, or active member of the event's organization |
| Join/read/send in a chat room | Any authenticated user who has joined (and not left) an open room |
| Close a chat room | The post's author only |
| Resolve a complaint | The complaint's owner or an admin |
| See complaint poster identity | Admin only |

- The frontend session (token and user) is stored in `localStorage` under `campus_buzz_session`. Frontend role checks only control what the UI shows. The backend is the authority.

---

## API reference

Base URL: `http://localhost:5000`. Errors are JSON of the form `{ "message": "...", "errors": [...] }`, where `errors` carries Zod issues on validation failures (`400`).

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | No | Liveness check |
| POST | `/api/auth/login` | No | Log in |
| GET | `/api/posts` | Yes | Active, non-expired Campus Buzz posts (newest first) |
| POST | `/api/posts` | `STUDENT` | Create post. `multipart/form-data`: `image` (file), `title`, `description`, `hashtags` (JSON array string), optional `contactName`, `contactPhone`, `expiresAt` |
| GET | `/api/posts/:id/contact` | Yes | Contact name/phone for active `#resell`, `#lost`, `#found` posts |
| GET | `/api/chat/post/:postId` | Yes | Room details for a post, with member count and `isMember`/`isCreator` flags |
| POST | `/api/chat/:roomId/join` | Yes | Join a room |
| POST | `/api/chat/:roomId/leave` | Yes | Leave a room |
| GET | `/api/chat/:roomId/messages` | Yes (member) | Message history |
| POST | `/api/chat/:roomId/messages` | Yes (member) | Send message `{ content }` |
| POST | `/api/chat/:roomId/close` | Yes (author) | Close a room |
| GET | `/api/official` | Yes | List official posts (with linked event, if any) |
| POST | `/api/official` | Yes | Create official post `{ title, content, organizationId, link?, formUrl? }` |
| DELETE | `/api/official/:id` | Yes | Delete official post (unlinks its event) |
| GET | `/api/events` | Yes | List events ordered by start time |
| POST | `/api/events` | Yes | Create event `{ name, date: YYYY-MM-DD, time: HH:MM, venue, description, organizationId?, linkedOfficialPostId? }` |
| PATCH | `/api/events/:id` | Yes | Partial update |
| DELETE | `/api/events/:id` | Yes | Delete event |
| GET | `/api/organizations` | Yes | List organizations |
| GET | `/api/complaints` | Yes | List complaints |
| POST | `/api/complaints` | Yes | Create `{ title, description, category? }` |
| PATCH | `/api/complaints/:id/resolve` | Yes | Mark resolved |
| GET | `/api/notifications` | Yes | Current user's notifications |
| PATCH | `/api/notifications/:id/read` | Yes | Mark one read |
| PATCH | `/api/notifications/read-all` | Yes | Mark all read |
| GET | `/uploads/*` | No | Static uploaded images |

Field limits (from the Zod schemas): complaint title 200 / description 5000 characters; event name 200 / venue 300 / description 5000; official post title 200 / content 5000; chat message 1000.

---

## Real-time events

Socket.IO runs on the same port as the HTTP server.

| Direction | Event | Payload | Notes |
|---|---|---|---|
| Client → server | `join-room` | `roomId`, ack callback `{ ok, message? }` | Only succeeds if the user already joined via REST and the room is open |
| Client → server | `leave-room` | `roomId` | Leaves the socket room |
| Server → client | `new-message` | message object | Emitted to the room after a REST `POST .../messages` |
| Server → client | `room-member-joined` / `room-member-left` | `{ userId }` | Sent to other sockets in the room |
| Server → client | `notification` | formatted notification | Sent to the private `user:<userId>` room, which every socket joins on connect |

There is no socket event for sending messages. Sending goes through REST.

---

## Data model

Defined in `backend/prisma/schema.prisma` (PostgreSQL):

- **User** (`rollNumber` and `instituteEmail` unique, `role`: `STUDENT | ADMIN`)
- **Organization** (`type`: `CLUB | COMMITTEE`) and **Membership** (unique per user and organization, `status`: `ACTIVE | INACTIVE`)
- **Post** (`feedType`, `interactionType`: `FOOD_SPLIT | CAB_SPLIT | RESELL | LOST | FOUND`, `status`: `ACTIVE | CLOSED`, `expiresAt`, reminder timestamps, contact fields), **Hashtag**, **PostHashtag**
- **ChatRoom** (one per post, `status`: `OPEN | CLOSED`), **ChatMember**, **Message**
- **OfficialPost** and **Event** (optional one-to-one link to an official post)
- **Complaint** (`status`: `OPEN | RESOLVED`, `category`)
- **Notification** (`type`: `ROOM_MESSAGE | PARTICIPANT_JOINED | EXPIRY_APPROACHING | EVENT_ALERT | COMPLAINT_RESOLVED`)

The schema also defines a `FeedType.OFFICIAL` value. Official announcements are stored in the separate `OfficialPost` model, and the feed endpoint only returns `CAMPUS_BUZZ` posts.

---

## Background jobs

Both jobs start with the server, run once immediately, and then every 60 seconds. They stop on `SIGINT`/`SIGTERM`.

- **Post expiry** (`jobs/post-expiry.job.ts`): closes expired `FOOD_SPLIT` / `CAB_SPLIT` posts and their open chat rooms.
- **Expiry reminders** (`jobs/expiry-reminder.job.ts`): sends the author a notification at about 30 minutes and about 5 minutes before expiry, tracked per post so each is sent once.

Because the jobs run in-process, running multiple backend instances would run them multiple times. They have not been made multi-instance safe.

---

## Testing and quality checks

- **Automated tests:** none found. No test files or test runner are configured in either package.
- **Static checks run while preparing this README:** `tsc` against the backend build config and `tsc --noEmit` on the frontend both reported no errors, and `eslint` on the frontend printed no findings. This verifies type correctness only, not runtime behaviour.

---

## Known limitations and security notes

These are visible in the current code and worth addressing before any real deployment:

1. **Login has no password or other secret.** `passwordHash` exists in the schema, but the login service looks the user up by roll number and email and issues a token without verifying a password. Anyone who knows a valid pair can sign in. The seed script sets `passwordHash` to the placeholder `NOT_USED_FOR_LOGIN`.
2. **Admin dashboard is mock-only** (see [status](#implementation-status)).
3. **Resell offers** are not supported by the server.
4. **No registration or organization-management API.** Users, organizations and memberships must be created through the seed script or the database.
5. **Contact details** for `#resell`, `#lost` and `#found` posts are available to any authenticated user via `/api/posts/:id/contact`.
6. **Uploads are stored on local disk** and served publicly, so they are not suitable for ephemeral or multi-instance hosting without changes.
7. **JWT stored in `localStorage`** on the frontend, with a 7-day lifetime and no refresh or revocation mechanism.
8. **No rate limiting, security headers or request logging middleware** were found in the backend.
9. `EVENT_ALERT` notifications are defined but never generated, and `requireOrganizationMembership` middleware exists but is not used by any route.

---

## Team

| Name | Role | GitHub |
|---|---|---|
| Priyal Pinjani | Backend, database | [@emerald-13-coder](https://github.com/emerald-13-coder) |
| Ashutosh Dewangan | Frontend, UI | [@](https://github.com/Ashutosh-Dewangan) |
<!-- Add teammates here: | Name | Role | GitHub | -->

## License

No `LICENSE` file is present. `backend/package.json` declares `ISC`, but the frontend and root `package.json` declare no license. **The maintainers need to confirm the intended license** and add a `LICENSE` file.
