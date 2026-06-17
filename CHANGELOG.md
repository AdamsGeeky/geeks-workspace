# Changelog

All notable changes to the GeekInk Workspace project are documented in this file.

## [0.1.0] - 2026-06-17

### 🎉 Initial Project Scaffold

This is the **first complete frontend build** of GeekInk Workspace — a community-first learning platform for students, mentors, and admins.

### ✨ Features

#### Core Infrastructure
- **Next.js 16 App Router** with TypeScript and Tailwind CSS v3
- **shadcn/ui** component library with base-nova preset
- **React Query** (TanStack Query) for server state management
- **Zustand** for client-side auth state
- **Axios** HTTP client with error handling and interceptors
- **React Hook Form + Zod** for type-safe form validation
- **Turbopack** bundler (stable in Next.js 16)

#### Authentication & Security
- Cookie-based session authentication via **proxy.ts** (Next.js middleware renamed)
- Login/Register pages with validation forms
- Protected routes that redirect unauthenticated users to `/login`
- Auth store for managing current user and role
- Role-based UI (Student, Mentor, Admin)

#### App Shell & Navigation
- **Responsive Sidebar** (desktop) with collapsible navigation
- **Mobile Sheet Drawer** navigation with hamburger menu
- Unread notification counter in sidebar
- User avatar + role badge in header
- Logout functionality
- Role-aware nav links (admin-only links hidden from students)

#### Dashboard
- Quick stats grid: Assignments Due, Challenges Completed, Community Posts, Leaderboard Position
- Recent Announcements section
- Activity Feed with mock timeline data
- Welcome greeting with user's cohort info

#### Announcements
- Pinned announcements with priority indicator
- Recent announcements cards with timestamps
- Category filter buttons (All, Course Updates, Assignments, Events)
- Mock data for preview mode

#### Assignments
- List view with status tabs (All, Pending, Submitted, Graded)
- Difficulty badges (Easy, Medium, Hard)
- Assignment detail page with full description
- Submission form with file upload preview
- Submission history and grading status

#### Community Feed
- Post cards with author info, timestamps, and engagement counts
- Like/unlike functionality with optimistic updates
- Comments section with nested replies
- Create post form with textarea
- User mention support

#### Notifications
- Grouped notification list (Assignments, Community, System)
- Mark individual notifications as read
- Mark all as read action
- Notification detail expansion

#### Materials
- Search functionality
- File type filters (All, PDFs, Videos, Code, Docs)
- Material cards with preview, title, and download button
- Organized by category

#### Challenges
- XP reward banner per challenge
- Difficulty-tagged cards (Beginner, Intermediate, Advanced)
- Status indicators (Not Started, In Progress, Completed)
- Leaderboard section showing top solvers
- Challenge detail with description and submission

#### Profile
- User avatar (large size variant)
- Name, role, and cohort display
- Level and XP progress bar
- Badges earned section
- Activity history timeline
- Links to user's posts and submissions

#### Cohorts
- Cohort list with member count and status
- Cohort detail page with members grid
- Assignments by cohort view
- Member roles and activity status

#### Admin Panel
- Admin-only route (`/admin`)
- Stats grid: Total Users, Active Cohorts, Pending Submissions, System Health
- Submission review queue
- Quick action buttons (approve, reject, message)
- User management stub

### 🎨 Design System

#### Colors
- **Primary Brand**: Green (#16a34a) – represents growth and learning
- **Neutrals**: White, Gray-100, Gray-200, Gray-950 (text/backgrounds)
- **Accents**: Blue-500 (info), Red-500 (danger), Amber-500 (warning), Green-600 (success)

#### Typography
- **Headings**: Geist Sans (modern, friendly)
- **Body**: Geist Sans (consistent, readable)
- **Line Height**: 1.5 for body text

#### Component Library
- Button (4 variants: default, secondary, outline, ghost)
- Input, Textarea, Select, Label
- Card with Header/Title/Description/Content/Footer
- Badge (4 variants for status/category)
- Dialog, Sheet (mobile drawer), Alert
- Avatar with auto-generated initials fallback
- Separator, Skeleton, Progress, Tabs

### 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/               # Auth routes (login, register)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (app)/                # Protected app routes
│   │   ├── dashboard/page.tsx
│   │   ├── announcements/page.tsx
│   │   ├── assignments/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── community/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── materials/page.tsx
│   │   ├── challenges/page.tsx
│   │   ├── profile/[id]/page.tsx
│   │   ├── cohorts/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── admin/page.tsx
│   │   └── layout.tsx
│   ├── layout.tsx            # Root layout with providers
│   ├── page.tsx              # Redirect to dashboard
│   └── globals.css           # Global Tailwind styles
├── components/
│   ├── ui/                   # shadcn primitives
│   │   ├── button.tsx, card.tsx, input.tsx, etc.
│   ├── shared/               # Reusable components
│   │   ├── Providers.tsx     # React Query + Zustand
│   │   ├── AuthInitializer.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MobileNav.tsx
│   │   ├── UserAvatar.tsx    # With size variants
│   │   ├── RoleBadge.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── EmptyState.tsx
│   │   ├── PageLoader.tsx
│   │   └── CardSkeleton.tsx
│   └── features/
│       └── auth/
│           ├── LoginForm.tsx
│           └── RegisterForm.tsx
├── lib/
│   ├── api.ts                # Axios client
│   ├── queryClient.ts        # React Query config
│   ├── handleApiError.ts     # Error handling
│   └── utils.ts              # cn(), tailwind helpers
├── store/
│   └── authStore.ts          # Zustand auth
├── hooks/
│   └── useUnreadNotificationCount.ts
├── types/
│   └── index.ts              # All TypeScript types
├── constants/
│   └── index.ts              # APP_NAME, API routes, etc.
├── proxy.ts                  # Route protection middleware
├── middleware.ts             # Turbopack/Next.js 16 proxy config
└── next.config.ts
```

### 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| Components | shadcn/ui (base-nova) |
| State (Server) | React Query v5 |
| State (Client) | Zustand |
| Forms | React Hook Form + Zod |
| HTTP | Axios |
| Bundler | Turbopack |
| Database | DigitalOcean PostgreSQL (via API) |
| Icons | Lucide React |

### 📱 Responsive Design

- **Mobile-first** approach
- **Desktop**: Sidebar navigation (150px) + main content
- **Tablet**: Responsive grid layouts (2-3 columns)
- **Mobile**: Sheet drawer navigation, stacked layouts
- All pages tested on viewport sizes 375px–1920px

### 🔐 Security

- Cookie-based session validation in `proxy.ts`
- Protected routes redirect unauthenticated users
- Form inputs validated with Zod schema
- API error handling with proper HTTP status codes
- CORS-safe Axios configuration

### 🧪 Testing & Mock Data

All pages include **mock data fallback** for development/preview:
- Mock announcements, assignments, posts, etc.
- No real API calls required to see UI
- Hydration-safe data fetching with React Query

### 🐛 Known Issues & Troubleshooting

#### Turbopack Build Cache Error

**Error**: `ENOENT: no such file or directory, open '.../build-manifest.json'`

**Solution**:
```bash
# Clear dev cache
rm -rf .next/dev

# Or if that doesn't work:
rm -rf .next
npm run dev
```

This happens when:
- Switching between git branches
- Pulling changes with new/deleted files
- Interrupted builds

### 📝 Environment Variables

Create a `.env.local` file in the project root (if connecting to real API):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=GeekInk Workspace
```

Currently, all API calls fallback to mock data, so no env vars are required for preview.

### 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open browser
open http://localhost:3000

# Login page redirects unauthenticated users
# Navigate to /login or /register
```

### 📦 Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

### 🎯 Next Steps

- [ ] Connect to real DigitalOcean API
- [ ] Implement OAuth login (Google, GitHub)
- [ ] Add real-time notifications (WebSocket/SSE)
- [ ] Implement file upload to Blob storage
- [ ] Add search/filtering for all list pages
- [ ] Dark mode toggle
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] E2E tests with Playwright
- [ ] Unit tests with Vitest
- [ ] Storybook for component library

### 📄 Documentation

- **[SPEC.md](./docs/SPEC.md)** – Full product specification
- **[PRD.md](./docs/PRD.md)** – Product requirements document
- **[API_CONTRACTS.md](./docs/API_CONTRACTS.md)** – Backend API schema
- **[TODO.md](./TODO.md)** – Detailed task breakdown

### 🙏 Credits

Built with v0 (Vercel's AI code generator) using Next.js 16, shadcn/ui, and Tailwind CSS.

---

**Last Updated**: June 17, 2026  
**Status**: ✅ Ready for Preview & Development
