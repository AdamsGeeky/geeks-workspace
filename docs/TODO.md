# GeekInk Workspace — AI Code Generator Prompt Guide
### Step-by-step, Feature-by-Feature Prompts for Next.js + shadcn/ui

> **How to use this guide:**
> Copy each prompt block into your AI code generator v0 **in order**. Each prompt builds on the previous one. Do not skip steps.
>
> **Stack:** Next.js  (App Router) · TypeScript · Tailwind CSS · shadcn/ui · TanStack Query v5
> **Primary Color:** Green (`#16a34a` / Tailwind `green-600`)
> **API Base URL:** `https://geekink-cloud-sp39l.ondigitalocean.app/api/v1`

---

## PROMPT 0 — Project Bootstrap & Global Setup

```
Create a new Next.js 14 project using the App Router with TypeScript and Tailwind CSS.

Project name: geekink-workspace

Install these dependencies:
- @tanstack/react-query @tanstack/react-query-devtools
- axios
- zustand
- shadcn/ui (run: npx shadcn-ui@latest init)
- lucide-react
- date-fns
- react-hook-form
- @hookform/resolvers
- zod

Tailwind primary color config:
In tailwind.config.ts extend colors with:
  primary: {
    DEFAULT: "#16a34a",   // green-600
    foreground: "#ffffff",
    light: "#dcfce7",     // green-100
    dark: "#14532d",      // green-900
  }

In globals.css set CSS variables:
  --primary: 142 71% 45%;
  --primary-foreground: 0 0% 100%;

shadcn/ui init answers:
- Style: Default
- Base color: Green
- CSS variables: Yes

Create these folders:
src/
  app/                    ← Next.js App Router pages
  components/
    ui/                   ← shadcn auto-generated
    shared/               ← reusable app components
    features/             ← feature-specific components
  lib/
    api.ts                ← axios instance
    queryClient.ts        ← TanStack Query client
  hooks/                  ← custom hooks per feature
  store/                  ← zustand stores
  types/                  ← TypeScript types
  constants/              ← app-wide constants

In src/lib/api.ts:
- Create an axios instance with baseURL = "https://geekink-cloud-sp39l.ondigitalocean.app/api/v1"
- Add a request interceptor that reads the accessToken from localStorage and attaches: Authorization: Bearer <token>
- Add a response interceptor that on 401 clears localStorage and redirects to /login

In src/lib/queryClient.ts:
- Create and export a QueryClient with defaultOptions:
  - staleTime: 30_000
  - gcTime: 300_000
  - retry: 1

Wrap the root layout (src/app/layout.tsx) with QueryClientProvider and ReactQueryDevtools.

Create src/types/index.ts and paste ALL of these TypeScript types exactly:

export type UserRole = 'STUDENT' | 'MENTOR' | 'ADMIN';
export type AssignmentStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type SubmissionStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'COMPLETED' | 'NEEDS_REVISION' | 'REJECTED';
export type ReactionType = 'LIKE' | 'FIRE' | 'CLAP' | 'INSPIRE';
export type NotificationType = 'ANNOUNCEMENT' | 'ASSIGNMENT' | 'SUBMISSION_FEEDBACK' | 'COMMUNITY' | 'SYSTEM';
export type ChallengeStatus = 'DRAFT' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
export type ChallengeParticipantStatus = 'JOINED' | 'SUBMITTED' | 'COMPLETED' | 'WITHDRAWN';
export type PushPlatform = 'IOS' | 'ANDROID' | 'WEB';
export type FileOwnerType = 'USER' | 'MATERIAL' | 'ASSIGNMENT' | 'SUBMISSION' | 'COMMUNITY_POST';
export type AchievementType = 'SUBMISSION' | 'COMMUNITY' | 'STREAK' | 'MENTOR' | 'CHALLENGE' | 'RECOGNITION';
export type ISODateString = string;
export type UUID = string;

export interface SafeUser { id: UUID; fullName: string; email: string; role: UserRole; avatarUrl: string | null; bio: string | null; createdAt: ISODateString; updatedAt: ISODateString; }
export interface Cohort { id: UUID; name: string; description: string | null; mentorId: UUID | null; createdAt: ISODateString; updatedAt: ISODateString; mentor?: SafeUser | null; members?: CohortMemberWithUser[]; }
export interface CohortMember { id: UUID; cohortId: UUID; userId: UUID; createdAt: ISODateString; }
export interface CohortMemberWithUser extends CohortMember { user: SafeUser; }
export interface Announcement { id: UUID; title: string; content: string; cohortId: UUID | null; isGlobal: boolean; createdBy: UUID; createdAt: ISODateString; updatedAt: ISODateString; reads?: AnnouncementRead[]; }
export interface AnnouncementRead { id: UUID; announcementId: UUID; userId: UUID; readAt: ISODateString; }
export interface Material { id: UUID; title: string; description: string | null; url: string | null; fileUrl: string | null; cohortId: UUID; createdBy: UUID; createdAt: ISODateString; updatedAt: ISODateString; }
export interface Assignment { id: UUID; title: string; description: string; deadline: ISODateString | null; cohortId: UUID; createdBy: UUID; status: AssignmentStatus; createdAt: ISODateString; updatedAt: ISODateString; submissions?: Submission[]; }
export interface Submission { id: UUID; assignmentId: UUID; studentId: UUID; githubUrl: string | null; fileUrl: string | null; note: string | null; status: SubmissionStatus; feedback: string | null; reviewedBy: UUID | null; submittedAt: ISODateString; reviewedAt: ISODateString | null; createdAt: ISODateString; updatedAt: ISODateString; assignment?: Assignment; student?: SafeUser; }
export interface CommunityPost { id: UUID; authorId: UUID; content: string; imageUrl: string | null; createdAt: ISODateString; updatedAt: ISODateString; author?: Pick<SafeUser, 'id' | 'fullName' | 'email' | 'role' | 'avatarUrl' | 'bio' | 'createdAt' | 'updatedAt'>; comments?: Comment[]; reactions?: Reaction[]; }
export interface Comment { id: UUID; authorId: UUID; postId: UUID | null; submissionId: UUID | null; content: string; createdAt: ISODateString; updatedAt: ISODateString; author?: Pick<SafeUser, 'id' | 'fullName' | 'email' | 'role' | 'avatarUrl' | 'bio' | 'createdAt' | 'updatedAt'>; }
export interface Reaction { id: UUID; userId: UUID; postId: UUID; type: ReactionType; createdAt: ISODateString; }
export interface Notification { id: UUID; userId: UUID; title: string; message: string; type: NotificationType; fingerprint: string | null; isRead: boolean; createdAt: ISODateString; updatedAt: ISODateString; }
export interface Challenge { id: UUID; title: string; description: string; cohortId: UUID | null; startsAt: ISODateString; endsAt: ISODateString; rewardConfig: Record<string, unknown> | null; status: ChallengeStatus; createdBy: UUID | null; createdAt: ISODateString; updatedAt: ISODateString; participants?: ChallengeParticipant[]; }
export interface ChallengeParticipant { id: UUID; challengeId: UUID; userId: UUID; status: ChallengeParticipantStatus; submissionUrl: string | null; note: string | null; submittedAt: ISODateString | null; createdAt: ISODateString; updatedAt: ISODateString; }
export interface AuthResponse { user: SafeUser; accessToken: string; }
export interface PaginatedEnvelope<T> { data: T[]; meta: { cursor: string | null; hasMore: boolean }; actions: []; }
export interface Envelope<T> { data: T; actions: unknown[]; }
```

---

## PROMPT 1 — Authentication (Register & Login)

```
Build the authentication feature for GeekInk Workspace using Next.js App Router, shadcn/ui, and green as the primary color.

API endpoints:
  POST /auth/register   — public, no auth required
  POST /auth/login      — public, no auth required
  GET  /auth/me         — requires Bearer token

--- Register rules ---
Request body: { fullName: string, email: string, password: string }
Do NOT expose a role field. Backend only allows STUDENT on public registration.
On 409 show: "This email is already registered."
On 400 show: "Registration is only open to students."
On success: store accessToken in localStorage, store user in Zustand, redirect to /dashboard

--- Login rules ---
Request body: { email: string, password: string }
On 401 show: "Invalid email or password."
On success: store accessToken in localStorage, store user in Zustand, redirect to /dashboard

--- Zustand auth store (src/store/authStore.ts) ---
State: { user: SafeUser | null, accessToken: string | null }
Actions: setAuth(user, accessToken), clearAuth()
On app load, read token from localStorage and call GET /auth/me to restore session. If 401, call clearAuth().

--- Pages to create ---
src/app/(auth)/login/page.tsx
src/app/(auth)/register/page.tsx
src/app/(auth)/layout.tsx  ← centered card layout, green logo/brand at top

--- Components to create ---
src/components/features/auth/LoginForm.tsx
src/components/features/auth/RegisterForm.tsx

--- LoginForm fields ---
- email (type email, required)
- password (type password, required)
- Submit button: "Sign in" — use primary green Button from shadcn

--- RegisterForm fields ---
- fullName (required, not empty)
- email (required, valid email)
- password (required, not empty)
- Submit button: "Create account"

Use react-hook-form + zod for validation on both forms.
Show inline field errors below each input using shadcn FormMessage.
Show a loading spinner inside the submit button while the request is in flight.
Show a top-level Alert (shadcn) for API errors (wrong credentials, duplicate email, etc).

TanStack Query mutations:
  queryKey invalidation on login/register success: ['auth', 'me']

After login/register, redirect to /dashboard.
If the user visits /login or /register while already logged in, redirect to /dashboard.
Protect all non-auth routes with a middleware (src/middleware.ts) that checks for the token; redirect to /login if missing.
```

---

## PROMPT 2 — App Shell & Navigation

```
Build the persistent app shell for GeekInk Workspace. This wraps all authenticated pages.

Layout file: src/app/(app)/layout.tsx

--- Sidebar (desktop) ---
Show on md+ screens. Fixed left, full height.
Brand: "GeekInk" in bold green at top.
Nav links (use lucide-react icons):
  - Dashboard        → /dashboard        (LayoutDashboard icon)
  - Announcements    → /announcements     (Megaphone icon)
  - Assignments      → /assignments       (ClipboardList icon)
  - Community        → /community         (Users icon)
  - Challenges       → /challenges        (Trophy icon)
  - Materials        → /materials         (BookOpen icon)
  - Notifications    → /notifications     (Bell icon) + unread badge count
  - Profile          → /profile           (User icon)

Only show these links based on role (from Zustand authStore):
  - ADMIN also sees:  Admin → /admin,  Cohorts → /cohorts
  - MENTOR also sees: Cohorts → /cohorts
  - STUDENT only sees the base list above

Active link: highlight with green-100 background and green-600 text.

--- Top navbar (mobile) ---
Show on screens below md.
Hamburger menu opens a slide-out drawer (shadcn Sheet) with the same nav links.
Show current user avatar + name on the right of the top bar.

--- User menu (bottom of sidebar on desktop) ---
Show avatar (or fallback initials), fullName, role badge.
"Sign out" button → clears auth state (clearAuth from Zustand), removes token from localStorage, redirects to /login.

--- Unread notification count ---
Create a hook: useUnreadNotificationCount
  - Fetches GET /notifications (query key: ['notifications'])
  - Filters where isRead === false
  - staleTime: 15 seconds
  - Returns the count
Display as a small green badge on the Bell icon.

Role badge colors:
  STUDENT → green
  MENTOR  → blue
  ADMIN   → purple
```

---

## TODO 3 — Dashboard

```
Build the Dashboard page for GeekInk Workspace.

Page: src/app/(app)/dashboard/page.tsx

API endpoint: GET /dashboard/me
  - Requires Bearer token
  - Returns one of three shapes depending on user role:
      { data: { role: 'STUDENT', ... } }
      { data: { role: 'MENTOR', ... } }
      { data: { role: 'ADMIN', ... } }

TanStack Query:
  queryKey: ['dashboard', 'me']
  staleTime: 15 seconds

--- IMPORTANT: switch on data.role to render the correct dashboard ---

=== STUDENT Dashboard ===
Show these cards in a responsive grid (2 cols on md, 3 on lg):

1. Today's Mission card
   - title, message from data.todayMission
   - A green CTA button using data.todayMission.primaryAction.label
   - When clicked, navigate to data.todayMission.primaryAction.href

2. Streak card
   - data.streak.currentCount days
   - "Best: X days"
   - If expiresSoon: show orange warning "Streak expiring soon!"
   - If isActiveToday: show green checkmark

3. Reputation card
   - data.reputation.level (e.g. "Explorer")
   - data.reputation.score points
   - Progress breakdown: submission / community / mentor points

4. Active Assignments card (list)
   - From data.activeAssignments
   - Show title, deadline (formatted with date-fns), status badge
   - Empty state: "No active assignments right now."

5. Unread Feedback card
   - data.unreadFeedbackCount count
   - If latestFeedback: show assignment title + reviewer name + a View button

6. Active Challenges card
   - From data.activeChallenges
   - Show title, endsAt countdown, join button (navigates to /challenges)

7. Featured Builders card
   - From data.featuredBuilders
   - Show avatar, name, reason for each

8. Cohort Momentum card
   - activeBuilders, submissionsToday, postsToday

=== MENTOR Dashboard ===
Grid layout:

1. Pending Submissions card
   - data.pendingSubmissions list
   - Show student name, assignment title, submittedAt
   - "Review" button → /assignments (to be linked later)

2. Students At Risk card
   - data.studentsAtRisk
   - Show name, severity badge, reasons list
   - Empty state: "All students are on track."

3. Recognition Candidates card
   - data.recognitionCandidates
   - Show name, score, reputationGrowth

4. Cohort Momentum table
   - data.cohortMomentum
   - Columns: Cohort name, assignments count, students count

=== ADMIN Dashboard ===
Stats grid (4 cols):
  - Total Users: data.activeUsers
  - Activity Events: data.activityEvents
  - Completion Rate: data.completionRate (show as percentage)
  - Cohorts: data.cohortEngagement.cohorts

Below: show a link to /admin for full admin overview.

--- Loading state ---
Show skeleton cards (shadcn Skeleton) while fetching.

--- Error state ---
Show a shadcn Alert with retry button.
```

---

## PROMPT 4 — Announcements

```
Build the Announcements feature for GeekInk Workspace.

Pages:
  src/app/(app)/announcements/page.tsx

API endpoints:
  GET  /announcements           → list visible announcements
  POST /announcements           → create (MENTOR or ADMIN only)
  PATCH /announcements/:id/read → mark as read

TypeScript types used: Announcement, AnnouncementRead

TanStack Query:
  queryKey: ['announcements']
  staleTime: 30 seconds

--- List page layout ---
Header: "Announcements" with a "New Announcement" button (show only if role is MENTOR or ADMIN).

Each announcement card shows:
  - title (bold)
  - content (truncated to 3 lines, with expand toggle)
  - Created by + date (date-fns format: "Jun 12, 2026")
  - "Global" badge if isGlobal === true
  - Cohort name badge if cohortId is set
  - Read/Unread indicator:
      - Read: grey checkmark (check if reads array contains current user's id)
      - Unread: green dot + bold title
  - "Mark as read" button if unread → calls PATCH /announcements/:id/read
    On success: invalidate ['announcements']

--- New Announcement dialog (shadcn Dialog) ---
Show only for MENTOR and ADMIN.
Open on clicking "New Announcement" button.

Form fields (react-hook-form + zod):
  title    — required, not empty
  content  — required, not empty, Textarea
  isGlobal — boolean checkbox (show only if role === ADMIN; hide for MENTOR)
  cohortId — UUID select dropdown (required if isGlobal is false)
             Fetch cohort list from GET /cohorts for the dropdown options.

Validation rules:
  - If isGlobal is false, cohortId is required.
  - If isGlobal is true, cohortId is not needed (MENTOR cannot create global — hide option).

API: POST /announcements
Body: { title, content, cohortId?, isGlobal? }
On success: close dialog, invalidate ['announcements']
On error: show error Alert inside dialog.

--- Empty state ---
"No announcements yet. Check back later."

--- Loading state ---
Show 3 skeleton cards.
```

---

## PROMPT 5 — Assignments

```
Build the Assignments feature for GeekInk Workspace.

Pages:
  src/app/(app)/assignments/page.tsx
  src/app/(app)/assignments/[id]/page.tsx

API endpoints:
  GET   /assignments              → list visible assignments
  POST  /assignments              → create (MENTOR or ADMIN)
  PATCH /assignments/:id/status   → update status (MENTOR or ADMIN)
  POST  /submissions              → submit assignment (STUDENT only)
  GET   /submissions              → list own/mentored submissions
  PATCH /submissions/:id/review   → review submission (MENTOR or ADMIN)

TypeScript types: Assignment, Submission, AssignmentStatus, SubmissionStatus

TanStack Query keys:
  ['assignments']          staleTime: 30s
  ['assignments', id]      staleTime: 30s
  ['submissions']          staleTime: 30s

=== Assignment List Page ===

Header: "Assignments" + "Create Assignment" button (MENTOR/ADMIN only).

Filter tabs (shadcn Tabs):
  - All | Draft | Published | Closed (filter client-side by status)

Assignment card shows:
  - title
  - status badge:
      DRAFT     → grey
      PUBLISHED → green
      CLOSED    → red
  - deadline (if set): formatted date, red if past deadline
  - cohort name (if available)
  - "View" button → /assignments/:id

If role is MENTOR or ADMIN:
  - Show "Publish" button if status is DRAFT → calls PATCH /assignments/:id/status { status: 'PUBLISHED' }
  - Show "Close" button if status is PUBLISHED → calls PATCH /assignments/:id/status { status: 'CLOSED' }
  On success: invalidate ['assignments'], ['assignments', id]

--- Create Assignment Dialog (MENTOR/ADMIN only) ---
Form fields (react-hook-form + zod):
  title       — required
  description — required, Textarea
  deadline    — optional, date input (ISO format)
  cohortId    — required, UUID, dropdown from GET /cohorts

POST /assignments body: { title, description, deadline?, cohortId }
On success: invalidate ['assignments']

=== Assignment Detail Page /assignments/:id ===

Fetch: GET /assignments (filter by id client-side from list) — there is no GET /assignments/:id endpoint; use the list.

Show full description.
Show deadline with time remaining (date-fns formatDistanceToNow).
Show status badge.

--- Student submission section ---
Show if role === STUDENT.

Fetch submissions: GET /submissions, filter client-side by assignmentId === current assignment id and studentId === current user id.

If no submission yet:
  Show a "Submit Assignment" form with:
    githubUrl — optional URL input
    fileUrl   — optional URL input (note: backend stores metadata only, no file bytes)
    note      — optional textarea
  POST /submissions body: { assignmentId, githubUrl?, fileUrl?, note? }
  On success: invalidate ['submissions'], ['assignments'], ['dashboard', 'me']

If submission exists:
  Show submission status badge:
    SUBMITTED      → blue
    UNDER_REVIEW   → yellow
    COMPLETED      → green
    NEEDS_REVISION → orange
    REJECTED       → red
  Show feedback if present.
  Show "Resubmit" button (same form, same POST endpoint — backend upserts).

--- Mentor/Admin review section ---
Show if role is MENTOR or ADMIN.
List all submissions for this assignment from GET /submissions.
Each submission row shows: student name, githubUrl link, submittedAt, current status.
"Review" button opens a dialog:
  PATCH /submissions/:id/review body:
    status   — select from: UNDER_REVIEW | COMPLETED | NEEDS_REVISION | REJECTED
    feedback — optional textarea
  On success: invalidate ['submissions'], ['dashboard', 'me']
```

---

## PROMPT 6 — Community Feed

```
Build the Community Feed feature for GeekInk Workspace.

Page: src/app/(app)/community/page.tsx

API endpoints:
  GET  /community/posts                → list posts
  POST /community/posts                → create post
  POST /community/posts/:id/reactions  → react to post
  GET  /comments/posts/:id             → list comments for a post
  POST /comments                       → create comment

TypeScript types: CommunityPost, Comment, Reaction, ReactionType

TanStack Query keys:
  ['community', 'posts']        staleTime: 30s
  ['comments', 'post', postId]  staleTime: 30s

=== Feed layout ===
Left column (feed) | Right column (featured builders sidebar on desktop).

--- Create Post bar at top of feed ---
A card with a textarea ("Share something with the community...") and a "Post" button.
POST /community/posts body: { content: string, imageUrl?: string }
imageUrl: optional URL input (show as a collapsible "Add image URL" toggle).
On success: invalidate ['community', 'posts']

--- Post card ---
For each post show:
  - Author avatar (fallback: initials), fullName, role badge, createdAt (relative time)
  - content (full text)
  - imageUrl (if present, render as <img>)
  - Reaction bar: show counts for each ReactionType (LIKE 👍 FIRE 🔥 CLAP 👏 INSPIRE ✨)
    - Clicking a reaction calls POST /community/posts/:id/reactions { type: ReactionType }
    - Highlight the reaction the current user has already reacted with
    - On success: invalidate ['community', 'posts']
  - Comment count button → expands inline comment section
  - "Comment" text input at bottom of expanded section

--- Comment section (expanded per post) ---
Fetch: GET /comments/posts/:id (query key: ['comments', 'post', postId])
Show each comment: avatar, name, content, relative time.
Comment input at bottom:
  POST /comments body: { postId: UUID, content: string }
  On success: invalidate ['community', 'posts'], ['comments', 'post', postId]

--- Right sidebar: Featured Builders ---
Fetch: GET /featured-builders (query key: ['featured-builders'], staleTime: 5 min)
Show a small card for each builder: avatar, name, reason.
IMPORTANT: Do not call this endpoint more than once on render — it has a database write side effect.

--- Empty state ---
"No posts yet. Be the first to share something!"

--- Loading state ---
Show 3 skeleton post cards.
```

---

## PROMPT 7 — Notifications

```
Build the Notifications feature for GeekInk Workspace.

Page: src/app/(app)/notifications/page.tsx

API endpoints:
  GET   /notifications          → list own notifications
  PATCH /notifications/:id/read → mark as read (returns { count: number })

TypeScript types: Notification, NotificationType

TanStack Query:
  queryKey: ['notifications']
  staleTime: 15 seconds

=== Notifications page ===
Header: "Notifications" + "Mark all as read" button.

Filter tabs: All | Unread

For each notification card:
  - Icon based on type:
      ANNOUNCEMENT        → Megaphone (green)
      ASSIGNMENT          → ClipboardList (blue)
      SUBMISSION_FEEDBACK → MessageSquare (orange)
      COMMUNITY           → Users (purple)
      SYSTEM              → Bell (grey)
  - title (bold if unread)
  - message
  - createdAt (relative time)
  - Unread: green left border + "Mark as read" button
    → PATCH /notifications/:id/read
    → On success: invalidate ['notifications']
    → Note: backend returns { count: number } not a notification object. Don't try to update from the response shape.

"Mark all as read" button:
  - Loop through unread notifications and call PATCH for each.
  - After all resolve: invalidate ['notifications'].

--- Admin only: Create Notification ---
Show a "Create Notification" button (ADMIN only).
Opens a Dialog with form:
  userId  — UUID input (required)
  title   — required
  message — required
  type    — select from NotificationType values
POST /notifications body: { userId, title, message, type }
On success: close dialog, invalidate ['notifications']

--- Empty state ---
"You're all caught up! No notifications."

--- Loading state ---
Show 4 skeleton rows.
```

---

## PROMPT 8 — Materials (Resources)

```
Build the Materials (Resources) feature for GeekInk Workspace.

Page: src/app/(app)/materials/page.tsx

API endpoints:
  GET  /materials → list visible materials
  POST /materials → create material (MENTOR or ADMIN only)

TypeScript types: Material

TanStack Query:
  queryKey: ['materials']
  staleTime: 5 minutes

=== Materials page ===
Header: "Resources & Materials" + "Add Material" button (MENTOR/ADMIN only).

Filter: by cohort (dropdown populated from GET /cohorts, client-side filter).

Each material card shows:
  - title
  - description (if present)
  - Cohort badge (cohortId)
  - Link button: if url is set → "Open Link" (external link icon, opens in new tab)
  - File button: if fileUrl is set → "Download File"
  - createdAt date

--- Add Material Dialog (MENTOR/ADMIN only) ---
Form fields (react-hook-form + zod):
  title       — required
  description — optional textarea
  cohortId    — required UUID, dropdown from GET /cohorts
  url         — optional URL (link resource)
  fileUrl     — optional URL (file resource, note: backend stores URL metadata only — no actual upload)

POST /materials body: { title, description?, url?, fileUrl?, cohortId }
On success: close dialog, invalidate ['materials']

--- Empty state ---
"No materials have been added yet."

--- Loading state ---
Show 4 skeleton cards.
```

---

## PROMPT 9 — Challenges

```
Build the Challenges feature for GeekInk Workspace.

Page: src/app/(app)/challenges/page.tsx

API endpoints:
  GET  /challenges            → list visible challenges (paginated)
  POST /challenges            → create challenge (MENTOR or ADMIN)
  POST /challenges/:id/join   → join challenge (STUDENT only)
  POST /challenges/:id/submit → submit challenge (STUDENT only)

TypeScript types: Challenge, ChallengeParticipant, ChallengeStatus, ChallengeParticipantStatus

TanStack Query:
  queryKey: ['challenges', { limit: 20 }]
  staleTime: 30s
  Use infinite query with cursor pagination:
    pageParam = meta.cursor
    query param: ?limit=20&cursor=<cursor>

=== Challenges page ===
Header: "Challenges" + "Create Challenge" button (MENTOR/ADMIN only).

Filter tabs: All | Active | Ended

Each challenge card shows:
  - title
  - description (truncated)
  - status badge:
      DRAFT     → grey
      ACTIVE    → green
      ENDED     → slate
      CANCELLED → red
  - startsAt → endsAt range (formatted dates)
  - Participant count (data.participants?.length)
  - If STUDENT and status === ACTIVE and current time is between startsAt and endsAt:
      Show "Join" button → POST /challenges/:id/join
      If already joined (participant with JOINED status exists for current user), show "Submit" button instead.
  - "Submit" opens a dialog:
      submissionUrl — required URL
      note          — optional textarea
      POST /challenges/:id/submit body: { submissionUrl, note? }
      On success: close dialog, invalidate ['challenges', { limit: 20 }]

Load more: "Load more" button at bottom, uses meta.cursor and meta.hasMore.

--- Create Challenge Dialog (MENTOR/ADMIN only) ---
Form fields:
  title       — required
  description — required, textarea
  cohortId    — optional UUID, dropdown from GET /cohorts
  startsAt    — required, datetime-local input
  endsAt      — required, datetime-local input
  status      — select: DRAFT | ACTIVE (default ACTIVE)

Client-side validation: endsAt must be after startsAt.
POST /challenges body: { title, description, cohortId?, startsAt, endsAt, status? }
On success: close dialog, invalidate ['challenges', { limit: 20 }]

--- Empty state ---
"No challenges available right now."

--- Loading state ---
Skeleton cards.
```

---

## PROMPT 10 — User Profile

```
Build the User Profile feature for GeekInk Workspace.

Pages:
  src/app/(app)/profile/page.tsx            ← own profile
  src/app/(app)/profile/[id]/page.tsx       ← public profile by user id

API endpoints:
  GET   /auth/me            → current user (from Zustand, already cached)
  GET   /users/:id          → get any user (own or admin)
  PATCH /users/:id          → update profile
  GET   /streaks/me         → own streak
  GET   /reputation/me      → own reputation
  GET   /reputation/users/:id → public reputation
  GET   /achievements/me    → own achievements
  POST  /achievements/:id/claim → claim achievement

TanStack Query keys:
  ['users', id]         staleTime: 1 min
  ['streaks', 'me']     staleTime: 30s
  ['reputation', 'me']  staleTime: 30s
  ['achievements', 'me'] staleTime: 30s

=== Own Profile page (/profile) ===

Show:
  - Avatar (img or fallback initials in green circle)
  - fullName, email, role badge
  - bio
  - "Edit Profile" button → opens edit dialog

--- Edit Profile Dialog ---
Form fields (react-hook-form + zod):
  fullName  — optional string
  avatarUrl — optional URL input
  bio       — optional textarea

PATCH /users/:id (use current user id from Zustand)
Body: { fullName?, avatarUrl?, bio? }
Do NOT include role in the form (backend ignores it for non-admins).
If current user is ADMIN: show role select field (UserRole).
On success: invalidate ['auth', 'me'], ['users', id]

Below profile: show 3 stat cards in a row:
  1. Streak card (GET /streaks/me)
     - currentCount, bestCount, isActiveToday, expiresSoon
  2. Reputation card (GET /reputation/me)
     - score, level, submissionPoints, communityPoints, mentorPoints
  3. Achievements card (GET /achievements/me)
     - List all achievements
     - Unlocked: show icon + title + "Claim" button if claimedAt is null
       POST /achievements/:id/claim → on success invalidate ['achievements', 'me']
     - Locked: greyed out with lock icon

=== Public Profile page (/profile/:id) ===
Fetch: GET /users/:id (only works for own id or admin)
Show: name, avatar, bio, role badge.
Show reputation: GET /reputation/users/:id
No edit capability on public profile.
If 403: show "You can only view your own profile."
```

---

## PROMPT 11 — Cohort Management

```
Build the Cohort Management feature for GeekInk Workspace.

Pages:
  src/app/(app)/cohorts/page.tsx       ← list (MENTOR and ADMIN)
  src/app/(app)/cohorts/[id]/page.tsx  ← cohort detail

API endpoints:
  GET  /cohorts             → list all cohorts
  POST /cohorts             → create cohort (ADMIN only)
  GET  /cohorts/:id         → cohort detail (admin, assigned mentor, or member)
  POST /cohorts/:id/students → add student to cohort (admin or assigned mentor)

TypeScript types: Cohort, CohortMemberWithUser, SafeUser

TanStack Query keys:
  ['cohorts']     staleTime: 5 min
  ['cohorts', id] staleTime: 1 min

=== Cohort List page ===
Header: "Cohorts" + "Create Cohort" button (ADMIN only).

Each cohort card shows:
  - name
  - description
  - Mentor: assigned mentor name (from mentor field) or "No mentor assigned"
  - Member count (members?.length or fetch on detail)
  - "View" button → /cohorts/:id

--- Create Cohort Dialog (ADMIN only) ---
Form fields:
  name        — required
  description — optional
  mentorId    — optional UUID, dropdown populated from GET /users (ADMIN only)
               Filter dropdown to show only users with role === MENTOR

POST /cohorts body: { name, description?, mentorId? }
On success: close dialog, invalidate ['cohorts']

=== Cohort Detail page /cohorts/:id ===
Show cohort name, description, mentor info.
Member list table:
  Columns: Avatar | Name | Email | Role | Joined date
  Empty: "No students enrolled yet."

If role is ADMIN or assigned mentor:
  Show "Add Student" button → opens dialog
  Form: studentId — UUID input (or dropdown from GET /users filtered to STUDENT role)
  POST /cohorts/:id/students body: { studentId }
  On success: invalidate ['cohorts', id], ['cohorts']

Handle 403: "You do not have access to this cohort."
```

---

## PROMPT 12 — Admin Panel

```
Build the Admin Panel for GeekInk Workspace. Only accessible to users with role === ADMIN.

Pages:
  src/app/(app)/admin/page.tsx

API endpoints:
  GET /admin/overview → aggregate counts (ADMIN only)
  GET /users          → all users (ADMIN only)
  GET /activity       → all activity (ADMIN only)

Protect the /admin route:
  In the page, check Zustand authStore for role. If not ADMIN, show a 403 message and redirect to /dashboard.

=== Admin Overview page ===

Top stats grid (4 cards, 2 cols on mobile, 4 on desktop):
  1. Users: data.users
  2. Cohorts: data.cohorts
  3. Assignments: data.assignments
  4. Submissions: data.submissions
  5. Announcements: data.announcements
  6. Materials: data.materials
  7. Community Posts: data.communityPosts

TanStack Query key: ['admin', 'overview'], staleTime: 1 min

--- User Management section ---
Fetch: GET /users (query key: ['users'], staleTime: 1 min)
Table columns: Avatar | Full Name | Email | Role | Joined
Role column: badge colored by role (STUDENT=green, MENTOR=blue, ADMIN=purple)
"Edit" button per row → opens Edit User Dialog:
  Fields: fullName, avatarUrl, bio, role (all 3 roles selectable for admin)
  PATCH /users/:id
  On success: invalidate ['users'], ['users', id]

--- Activity Feed section ---
Fetch: GET /activity with limit=20 (query key: ['activity', 'all', { limit: 20 }], staleTime: 30s)
Show as a timeline list:
  - eventType, entityType, occurredAt (relative time)
  - userId if present
Load more button using cursor from meta.

--- Notifications section ---
Button: "Send Notification" → opens Create Notification dialog (same as Prompt 7).
```

---

## PROMPT 13 — Activity Feed & Gamification Sidebar

```
Add the Activity Feed and Gamification sidebar widget to the GeekInk Workspace.

These components are used across multiple pages (dashboard, profile).

=== Activity Feed Component ===
File: src/components/features/activity/ActivityFeed.tsx

Props:
  mode: 'me' | 'all'  (determines which endpoint to call)

API:
  GET /activity/me   → mode === 'me'  (query key: ['activity', 'me', { limit }])
  GET /activity      → mode === 'all' (query key: ['activity', 'all', { limit }], ADMIN only)

Pagination: infinite query using meta.cursor.

Each activity item shows:
  - eventType as human-readable label (e.g. "SUBMISSION_CREATED" → "Submitted an assignment")
  - entityType + occurredAt (relative time)
  - Green dot timeline connector on the left

Load more button at bottom.

staleTime: 30s.

=== Gamification Stats Widget ===
File: src/components/features/gamification/GamificationWidget.tsx

Fetches all three in parallel for current user:
  GET /streaks/me         → ['streaks', 'me']
  GET /reputation/me      → ['reputation', 'me']
  GET /achievements/me    → ['achievements', 'me']

staleTime: 30s for all.

Shows:
  1. Streak section: fire emoji + currentCount days + "Best: X" + expiry warning
  2. Reputation section: level label + score badge + breakdown bars (submission/community/mentor)
  3. Recent Achievements: last 3 unlocked achievements with icon and title
     - "Claim" button for unlocked but unclaimed
     - "View all" link → /profile

Use this widget in:
  - Dashboard page (for STUDENT role)
  - Profile page sidebar

=== Today's Mission Card ===
File: src/components/features/engagement/TodayMission.tsx

Only rendered for STUDENT role.
API: GET /engagement/today (query key: ['engagement', 'today'], staleTime: 15s)

Known primaryAction types and their routes:
  READ_FEEDBACK       → /assignments (filter to feedback)
  SUBMIT_ASSIGNMENT   → /assignments
  SUBMIT_CHALLENGE    → /challenges
  READ_ANNOUNCEMENT   → /announcements
  JOIN_CHALLENGE      → /challenges
  POST_COMMUNITY_UPDATE → /community

Show:
  - title + message from data.todayMission
  - Green CTA button with data.todayMission.primaryAction.label
    → navigates to the mapped route above

Do NOT re-derive or re-order actions; render exactly what the backend returns.
```

---

## PROMPT 14 — Error Handling, Loading States & Polish

```
Apply consistent error handling, loading states, and UI polish across the entire GeekInk Workspace.

=== Global Error Handling ===

In src/lib/api.ts response interceptor:
  - 401 → clearAuth() + redirect to /login
  - 403 → do not redirect; let each page handle with a 403 message
  - Network error → show a toast "Connection error. Please try again."

Install and configure shadcn Toast (Toaster). Place <Toaster /> in root layout.

Create a helper: src/lib/handleApiError.ts
  - Takes an axios error
  - Returns a human-readable message string
  - Maps: 409 → "Email already registered.", 400 → error.response.data.message, 401 → "Session expired.", 403 → "You don't have permission.", 404 → "Not found.", default → "Something went wrong."

=== Shared Loading Components ===
File: src/components/shared/PageLoader.tsx
  - Full page centered spinner (green) with "Loading..." label
  - Use for initial page loads

File: src/components/shared/CardSkeleton.tsx
  - shadcn Skeleton-based card placeholder
  - Props: count (number of skeleton cards to show)

File: src/components/shared/EmptyState.tsx
  - Props: icon (lucide icon), title, description, action? { label, href }
  - Centered layout with muted icon, title, description, optional CTA button

=== Route-level Protection ===
Middleware (src/middleware.ts):
  - Check for accessToken cookie or localStorage (use a readable cookie for SSR compatibility)
  - If not authenticated and path is not /login or /register: redirect to /login
  - If authenticated and path is /login or /register: redirect to /dashboard
  - Protect /admin path: only allow if role === ADMIN (read from JWT payload or stored role cookie)

=== Polish ===

1. All status badges must use consistent colors:
   DRAFT/JOINED         → slate/grey
   PUBLISHED/ACTIVE/COMPLETED → green
   CLOSED/ENDED/REJECTED → red
   UNDER_REVIEW         → yellow
   NEEDS_REVISION       → orange
   CANCELLED/WITHDRAWN  → red

2. All dates: use date-fns. Future dates show formatDistanceToNow with "in X days". Past dates show format("MMM d, yyyy").

3. All forms: disable submit button while mutation is in flight. Re-enable on settle.

4. All dialogs: close on successful mutation. Show error Alert inside dialog on failure (do not close).

5. All lists: show EmptyState component when data is an empty array.

6. Responsive: all pages must work on mobile (320px+) and desktop. Use Tailwind responsive prefixes throughout.

7. All external links (url, githubUrl, submissionUrl, fileUrl): open in new tab with rel="noopener noreferrer".

8. Avatar fallback: if avatarUrl is null, show a green circle with the user's initials (first letter of fullName).
```

---

## PROMPT 15 — Final Integration Check

```
Perform a final integration review and cleanup of GeekInk Workspace.

Run through this checklist and fix any gaps:

1. AUTH FLOW
   [ ] Register → stores token + user → redirects to /dashboard
   [ ] Login → stores token + user → redirects to /dashboard
   [ ] GET /auth/me called on app boot to restore session
   [ ] 401 anywhere → clears auth + redirects to /login
   [ ] Logout → clears localStorage + Zustand + redirects to /login

2. ROLE-BASED UI
   [ ] Nav only shows Admin + Cohorts links for ADMIN
   [ ] Nav shows Cohorts for MENTOR
   [ ] "Create Cohort" button only visible to ADMIN
   [ ] "Create Announcement" button visible to MENTOR and ADMIN
   [ ] "Create Assignment" button visible to MENTOR and ADMIN
   [ ] "Create Challenge" button visible to MENTOR and ADMIN
   [ ] "Submit Assignment" only visible to STUDENT
   [ ] "Review Submission" only visible to MENTOR and ADMIN
   [ ] "Join/Submit Challenge" only visible to STUDENT
   [ ] "Today Mission" tab only visible to STUDENT
   [ ] Role field in profile edit only editable by ADMIN
   [ ] Admin panel page redirects non-ADMIN to /dashboard

3. QUERY INVALIDATION
   [ ] Login/register → invalidate ['auth', 'me']
   [ ] Profile update → invalidate ['auth', 'me'], ['users', id]
   [ ] Create announcement → invalidate ['announcements']
   [ ] Mark announcement read → invalidate ['announcements']
   [ ] Create assignment → invalidate ['assignments']
   [ ] Update assignment status → invalidate ['assignments'], ['assignments', id]
   [ ] Submit/resubmit → invalidate ['submissions'], ['assignments'], ['dashboard', 'me'], ['streaks', 'me'], ['reputation', 'me'], ['achievements', 'me'], ['activity', 'me']
   [ ] Review submission → invalidate ['submissions'], ['dashboard', 'me']
   [ ] Create post → invalidate ['community', 'posts']
   [ ] React to post → invalidate ['community', 'posts']
   [ ] Create comment → invalidate ['community', 'posts'], ['comments', 'post', postId]
   [ ] Join/submit challenge → invalidate ['challenges', { limit: 20 }]
   [ ] Mark notification read → invalidate ['notifications']
   [ ] Claim achievement → invalidate ['achievements', 'me']

4. API BASE URL
   [ ] All API calls go through the axios instance
   [ ] Base URL is: https://geekink-cloud-sp39l.ondigitalocean.app/api/v1
   [ ] Authorization header is attached to every authenticated request

5. UI CONSISTENCY
   [ ] Primary green color (#16a34a) used for all primary buttons, active states, badges
   [ ] All status badges use the correct colors from Prompt 14
   [ ] All forms use react-hook-form + zod
   [ ] All pages have loading skeletons and empty states
   [ ] All external URLs open in new tab
   [ ] Avatar fallback initials shown when avatarUrl is null
   [ ] Date-fns used for all date formatting

6. KNOWN BACKEND LIMITATIONS (do not implement these in frontend):
   [ ] No refresh token: on 401, just redirect to login (no silent refresh logic)
   [ ] No file upload: for fileUrl fields, only accept URL string input — no <input type="file">
   [ ] No notification preferences API: do not build a preferences settings page
   [ ] GET /featured-builders has a DB write side effect: never call it in a polling loop
   [ ] GET /dashboard/me emits an event: do not poll more often than every 15 seconds
   [ ] POST /achievements/:id/claim returns the full list, not just the claimed item

Fix any issues found and ensure the app builds without TypeScript errors.
Run: npx tsc --noEmit
```

---

## Quick Reference

| Feature | Page | Primary API |
|---|---|---|
| Auth | /login, /register | POST /auth/login, /auth/register |
| Dashboard | /dashboard | GET /dashboard/me |
| Announcements | /announcements | GET/POST /announcements |
| Assignments | /assignments, /assignments/:id | GET/POST /assignments, POST /submissions |
| Community | /community | GET/POST /community/posts |
| Challenges | /challenges | GET/POST /challenges |
| Materials | /materials | GET/POST /materials |
| Notifications | /notifications | GET/PATCH /notifications |
| Profile | /profile, /profile/:id | GET/PATCH /users/:id |
| Cohorts | /cohorts, /cohorts/:id | GET/POST /cohorts |
| Admin | /admin | GET /admin/overview, /users, /activity |

**API Base URL:** `https://geekink-cloud-sp39l.ondigitalocean.app/api/v1`
**Primary Color:** `#16a34a` (green-600)
**Auth:** `Authorization: Bearer <accessToken>` — stored in localStorage
