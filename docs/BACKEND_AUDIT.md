# Backend Implementation Audit

Source of truth: NestJS source under `src/`, Prisma schema under `prisma/schema.prisma`, and migrations under `prisma/migrations/`. Existing product docs were not used as authority.

## System Overview

The backend is a NestJS API for the GeekInk learning/workspace domain. Implemented capabilities include authentication, users, cohorts, announcements, materials, assignments, submissions, community posts/comments/reactions, file metadata, activity tracking, streaks, reputation, achievements, challenges, featured builders, dashboards, in-app notifications, FCM push delivery, push token registration, cohort momentum, and progress snapshots.

Core sources:

- NestJS application root imports all modules in `src/app.module.ts:32-61`.
- Global API prefix is `/api/v1` in `src/main.ts:9`.
- CORS is enabled globally in `src/main.ts:10`.
- Global validation uses `whitelist`, `forbidNonWhitelisted`, and `transform` in `src/main.ts:11-17`.
- Swagger is mounted at `/api/v1/docs` with bearer auth configured in `src/config/swagger.config.ts:4-18`.
- Prisma uses PostgreSQL with the generated client configured in `prisma/schema.prisma:6-14`.

## Request Lifecycle

```text
Client
  |
  v
NestJS HTTP server
  |
  v
Global prefix /api/v1 + CORS + ValidationPipe
  |
  v
Controller route
  |
  v
JwtAuthGuard and optional RolesGuard
  |
  v
DTO validation / transformation
  |
  v
Service business workflow
  |
  v
Repository or provider
  |
  v
Prisma / Firebase Admin / in-process event bus
```

## Service Architecture

```text
Controllers
  -> Services
    -> Repositories
      -> PrismaService
    -> DomainEventBusService
      -> ActivityService
      -> Subscribers:
         - StreaksService
         - ReputationService
         - AchievementsService
         - CohortMomentumService
         - UserProgressSnapshotService
         - NotificationOrchestratorService
    -> Providers:
       - InAppProvider
       - FcmPushProvider
       - FirebaseAdminService
```

`DomainEventBusService.emit()` persists every domain event through `ActivityService.record()` before invoking subscribers in-process; subscriber errors are logged and not rethrown (`src/event-bus/domain-event-bus.service.ts:21-42`).

## Domain Boundaries

| Boundary | Responsibility | Primary Sources |
|---|---|---|
| Auth | Register/login/me, password hashing, JWT issuance | `src/auth/auth.controller.ts:8-26`, `src/auth/auth.service.ts:24-93` |
| Users | Safe user profiles, self/admin profile updates, user role existence checks | `src/users/users.service.ts:16-57` |
| Cohorts | Cohort creation, membership, mentor ownership, cohort access checks | `src/cohorts/cohorts.service.ts:17-40`, `src/cohorts/cohort-access.service.ts:14-43` |
| Content | Announcements, materials, assignments | `src/announcements/announcements.service.ts:21-85`, `src/materials/materials.service.ts:14-28`, `src/assignments/assignments.service.ts:17-98` |
| Submissions | Student assignment submissions and mentor/admin reviews | `src/submissions/submissions.service.ts:21-105` |
| Community | Posts, comments, reactions | `src/community/community.service.ts:15-64`, `src/comments/comments.service.ts:23-77` |
| Engagement | Today Mission, dashboards, streaks, reputation, achievements, challenges | `src/engagement/today-mission.service.ts:20-82`, `src/dashboard/dashboard.service.ts:18-33` |
| Notifications | In-app notification rows, push tokens, FCM sending, notification scheduling rows | `src/notification-orchestrator/notification-orchestrator.service.ts:37-203`, `src/push-tokens/push-tokens.service.ts:10-21` |
| Admin | Counts and admin engagement dashboard | `src/admin/admin.repository.ts:8-36`, `src/dashboard/admin-engagement-dashboard.service.ts:9-49` |

## Dependency Flow

```text
Auth -> UsersRepository -> Prisma
Cohorts -> UsersService + CohortsRepository
Materials -> CohortAccessService + MaterialsRepository
Assignments -> CohortAccessService + AssignmentsRepository + EventBus
Submissions -> AssignmentsService + SubmissionsRepository + EventBus
Comments -> CommunityRepository + SubmissionsRepository + CommentsRepository + EventBus
Dashboard -> Engagement/Streaks/Reputation/Activity/Momentum/FeaturedBuilders/Prisma
NotificationOrchestrator -> EventBus + NotificationsRepository + Preferences + Providers
```

Module wiring is declared through Nest modules; representative exports/imports are listed in `src/*/*.module.ts` and summarized by `src/app.module.ts:33-60`.

## Implemented Infrastructure

- Database: PostgreSQL via Prisma adapter, `DATABASE_URL` required at startup (`src/prisma/prisma.service.ts:10-19`).
- Authentication: JWT bearer tokens only; no cookies, sessions, refresh tokens, or OAuth are implemented (`src/common/guards/jwt-auth.guard.ts:23-49`, `src/auth/auth.service.ts:81-93`).
- Authorization: route-level `@Roles()` metadata and `RolesGuard`, plus service-level ownership/cohort checks (`src/common/guards/roles.guard.ts:11-24`, `src/cohorts/cohort-access.service.ts:14-43`).
- Validation: class-validator DTOs and global whitelist/forbid validation (`src/main.ts:11-17`, `src/common/dto.ts:24-307`).
- Event handling: in-process event bus, no external queue (`src/event-bus/domain-event-bus.service.ts:16-42`).
- Background jobs/cron: none found. Scheduling rows exist for notifications, but no worker drains them.
- WebSockets: none found.
- File upload: no multipart upload handler; file API persists externally hosted file metadata (`src/files/files.controller.ts:13-20`, `src/files/files.service.ts:10-24`).
- Email: interface exists but no provider implementation is wired (`src/notification-orchestrator/notification-channel-provider.interface.ts:20-22`).
- Push: Firebase Admin FCM provider is implemented (`src/notification-orchestrator/fcm-push.provider.ts:22-60`, `src/firebase/firebase-admin.service.ts:24-42`).

## Module Inventory

### App Module

Purpose: Application composition and root health text endpoint.

Features:

- Imports all feature modules (`src/app.module.ts:33-60`).
- Exposes `GET /api/v1` returning `"Hello World!"` (`src/app.controller.ts:4-11`, `src/app.service.ts:3-7`).

Dependencies: all modules listed in `src/app.module.ts:2-30`.

Database Tables: none directly.

Public APIs: `GET /api/v1`.

Events Produced/Consumed: none.

### Auth Module

Purpose: Public registration/login and authenticated current-user lookup.

Features:

- Register public users as students only (`src/auth/auth.service.ts:24-29`).
- Enforce unique email before registration (`src/auth/auth.service.ts:31-34`).
- Hash passwords with bcrypt cost 12 (`src/auth/auth.service.ts:36`).
- Sign JWT access tokens with `sub`, `email`, `role` (`src/auth/auth.service.ts:81-91`).

Dependencies: UsersModule (`src/auth/auth.module.ts:7-10`), JwtModule exported by CommonModule (`src/common/common.module.ts:7-10`).

Database Tables: `users`.

Public APIs: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`.

Events Produced/Consumed: none.

### Users Module

Purpose: Manage user profile retrieval and updates.

Features:

- Admin lists all users (`src/users/users.controller.ts:16-19`).
- Users can view/update self; admins can view/update anyone (`src/users/users.service.ts:21-49`).
- Non-admin update ignores submitted `role` (`src/users/users.service.ts:39-46`).
- Safe user presenter removes `passwordHash` (`src/users/user.presenter.ts:3-8`).

Dependencies: PrismaService through repository.

Database Tables: `users`.

Public APIs: `GET /api/v1/users`, `GET /api/v1/users/:id`, `PATCH /api/v1/users/:id`.

Events Produced/Consumed: none.

### Cohorts Module

Purpose: Cohort creation, mentor assignment, membership, and access policies.

Features:

- Admin creates cohorts (`src/cohorts/cohorts.controller.ts:20-23`).
- Optional mentor must be a `MENTOR` user (`src/cohorts/cohorts.service.ts:17-20`).
- Admin or cohort mentor can add student; target user must be `STUDENT` (`src/cohorts/cohorts.service.ts:37-40`).
- View allowed to admin, assigned mentor, or cohort member (`src/cohorts/cohort-access.service.ts:14-30`).

Dependencies: UsersModule (`src/cohorts/cohorts.module.ts:8-12`).

Database Tables: `cohorts`, `cohort_members`.

Public APIs: `POST /api/v1/cohorts`, `GET /api/v1/cohorts`, `GET /api/v1/cohorts/:id`, `POST /api/v1/cohorts/:id/students`.

Internal Services: `CohortAccessService`.

Events Produced/Consumed: none.

### Announcements Module

Purpose: Global and cohort announcements with read tracking.

Features:

- Mentor/admin create announcements (`src/announcements/announcements.controller.ts:24-27`).
- Non-global announcements require `cohortId` (`src/announcements/announcements.service.ts:21-24`).
- Global announcements require admin (`src/announcements/announcements.service.ts:26-30`).
- Cohort announcements require manage access to cohort (`src/announcements/announcements.service.ts:32-34`).
- Mark-read uses upsert and emits an event (`src/announcements/announcements.repository.ts:31-36`, `src/announcements/announcements.service.ts:76-84`).

Dependencies: CohortsModule, EventBusModule (`src/announcements/announcements.module.ts:8-11`).

Database Tables: `announcements`, `announcement_reads`.

Public APIs: `POST /api/v1/announcements`, `GET /api/v1/announcements`, `PATCH /api/v1/announcements/:id/read`.

Events Produced: `ANNOUNCEMENT_CREATED`, `ANNOUNCEMENT_READ`.

Events Consumed: none.

### Materials Module

Purpose: Cohort learning material metadata.

Features:

- Mentor/admin create materials for manageable cohorts (`src/materials/materials.controller.ts:16-19`, `src/materials/materials.service.ts:14-23`).
- Users list materials visible through cohort membership or mentorship (`src/materials/materials.repository.ts:13-22`).

Dependencies: CohortsModule (`src/materials/materials.module.ts:7-10`).

Database Tables: `materials`.

Public APIs: `POST /api/v1/materials`, `GET /api/v1/materials`.

Events Produced/Consumed: none.

### Assignments Module

Purpose: Cohort assignments and publication.

Features:

- Mentor/admin create assignments for manageable cohorts (`src/assignments/assignments.controller.ts:28-31`, `src/assignments/assignments.service.ts:17-26`).
- Default assignment status is `DRAFT` unless DTO status provided (`src/assignments/assignments.service.ts:22-24`).
- Publishing emits `ASSIGNMENT_PUBLISHED` (`src/assignments/assignments.service.ts:28-40`, `src/assignments/assignments.service.ts:64-76`).
- Students see only published assignments in their cohorts; mentors see cohort/created assignments (`src/assignments/assignments.repository.ts:17-30`).

Dependencies: CohortsModule, EventBusModule (`src/assignments/assignments.module.ts:8-12`).

Database Tables: `assignments`.

Public APIs: `POST /api/v1/assignments`, `GET /api/v1/assignments`, `PATCH /api/v1/assignments/:id/status`.

Internal Services: `assertCanViewAssignment`, `assertCanManageAssignment`.

Events Produced: `ASSIGNMENT_PUBLISHED`.

Events Consumed: none.

### Submissions Module

Purpose: Student assignment submissions and mentor/admin review.

Features:

- Student-only create endpoint (`src/submissions/submissions.controller.ts:28-31`).
- Create checks assignment view access (`src/submissions/submissions.service.ts:26-29`).
- One submission per assignment/student enforced by upsert and database unique key (`src/submissions/submissions.repository.ts:16-32`, `prisma/schema.prisma:289`).
- Resubmission resets status to `SUBMITTED` and `submittedAt` (`src/submissions/submissions.repository.ts:23-29`).
- Review requires assignment manage access and writes reviewer/reviewedAt (`src/submissions/submissions.service.ts:61-77`).

Dependencies: AssignmentsModule, EventBusModule (`src/submissions/submissions.module.ts:8-12`).

Database Tables: `submissions`.

Public APIs: `POST /api/v1/submissions`, `GET /api/v1/submissions`, `PATCH /api/v1/submissions/:id/review`.

Events Produced: `SUBMISSION_CREATED`, `SUBMISSION_REVIEWED`, `MENTOR_FEEDBACK_RECEIVED`.

Events Consumed: none.

### Community Module

Purpose: Community feed posts and reactions.

Features:

- Any authenticated user can create/list posts and react (`src/community/community.controller.ts:12-37`).
- Reactions are idempotent per user/post/type (`src/community/community.repository.ts:28-39`).
- First reaction emits `COMMUNITY_POST_REACTED` (`src/community/community.service.ts:42-61`).

Dependencies: EventBusModule (`src/community/community.module.ts:7-11`).

Database Tables: `community_posts`, `reactions`.

Public APIs: `POST /api/v1/community/posts`, `GET /api/v1/community/posts`, `POST /api/v1/community/posts/:id/reactions`.

Events Produced: `COMMUNITY_POST_CREATED`, `COMMUNITY_POST_REACTED`.

Events Consumed: none.

### Comments Module

Purpose: Comments on community posts or submissions.

Features:

- Any authenticated user can create comments (`src/comments/comments.controller.ts:13-15`).
- Exactly one of `postId` or `submissionId` is required (`src/comments/comments.service.ts:23-26`).
- Target existence is checked (`src/comments/comments.service.ts:31-48`).
- Post comments can be listed in ascending creation order (`src/comments/comments.repository.ts:13-18`).

Dependencies: CommunityModule, SubmissionsModule, EventBusModule (`src/comments/comments.module.ts:9-12`).

Database Tables: `comments`.

Public APIs: `POST /api/v1/comments`, `GET /api/v1/comments/posts/:id`.

Events Produced: `COMMENT_CREATED`.

Events Consumed: none.

### Files Module

Purpose: Store file metadata records.

Features:

- Authenticated users create file metadata (`src/files/files.controller.ts:13-15`).
- Authenticated users list only files they uploaded (`src/files/files.repository.ts:13-17`).
- No multipart upload or object storage provider is implemented.

Dependencies: PrismaService.

Database Tables: `files`.

Public APIs: `POST /api/v1/files`, `GET /api/v1/files`.

Events Produced/Consumed: none.

### Notifications Module

Purpose: In-app notification rows and direct admin notification creation.

Features:

- Admin creates direct notification for a user (`src/notifications/notifications.controller.ts:24-27`).
- Users list own notifications (`src/notifications/notifications.service.ts:22-23`).
- Mark-read updates by notification id and user id (`src/notifications/notifications.repository.ts:61-65`).

Dependencies: PrismaService.

Database Tables: `notifications`.

Public APIs: `POST /api/v1/notifications`, `GET /api/v1/notifications`, `PATCH /api/v1/notifications/:id/read`.

Events Produced/Consumed: none directly; used by orchestrator.

### Push Tokens Module

Purpose: Device push token registration and deactivation.

Features:

- Register/upsert token for authenticated user (`src/push-tokens/push-tokens.service.ts:10-16`).
- Delete deactivates matching user/token and returns `{ deleted: true }` (`src/push-tokens/push-tokens.service.ts:18-20`).
- Active token lookup respects `notificationPreference.pushEnabled` (`src/push-tokens/push-tokens.repository.ts:39-58`).

Dependencies: PrismaService.

Database Tables: `push_tokens`, `notification_preferences`.

Public APIs: `POST /api/v1/push-tokens/register`, `DELETE /api/v1/push-tokens/:token`.

Events Produced/Consumed: none.

### Activity Module

Purpose: Persist and expose domain activity events.

Features:

- Admin lists all events (`src/activity/activity.controller.ts:21-24`).
- Users list own events (`src/activity/activity.controller.ts:16-18`).
- Cursor pagination returns `{ data, meta, actions }` (`src/activity/activity.service.ts:39-50`).

Dependencies: PrismaService.

Database Tables: `activity_events`.

Public APIs: `GET /api/v1/activity/me`, `GET /api/v1/activity`.

Internal Services: `ActivityService.record()`.

Events Produced: none.

Events Consumed: all emitted events are persisted through `record()`.

### Streaks Module

Purpose: Build streak state derived from activity events.

Features:

- Users read their build streak (`src/streaks/streaks.controller.ts:12-14`).
- Subscribes to build events (`src/streaks/streaks.service.ts:7-23`).
- Uses UTC calendar days (`src/streaks/streaks.service.ts:64-68`).

Dependencies: EventBusModule (`src/streaks/streaks.module.ts:7-11`).

Database Tables: `user_streaks`, `streak_entries`.

Public APIs: `GET /api/v1/streaks/me`.

Events Consumed: `SUBMISSION_CREATED`, `COMMUNITY_POST_CREATED`, `COMMENT_CREATED`, `CHALLENGE_SUBMITTED`.

### Reputation Module

Purpose: Reputation scores and public reputation summaries.

Features:

- Users read own summary and authenticated users can read another user's public summary (`src/reputation/reputation.controller.ts:13-20`).
- Event-derived points and levels (`src/reputation/reputation.service.ts:74-135`, `src/reputation/reputation.repository.ts:94-105`).

Dependencies: EventBusModule (`src/reputation/reputation.module.ts:7-11`).

Database Tables: `reputation_scores`, `reputation_events`.

Public APIs: `GET /api/v1/reputation/me`, `GET /api/v1/reputation/users/:id`.

Events Consumed: submission, review, community, challenge, featured-builder events.

### Achievements Module

Purpose: Achievement definitions, unlock state, and claim state.

Features:

- Seeds initial achievements on module init (`src/achievements/achievements.service.ts:14-17`, `src/achievements/achievements.repository.ts:5-69`).
- Users read all active achievements with their unlock/claim state (`src/achievements/achievements.service.ts:19-38`).
- Claim updates own unlocked achievement if unclaimed (`src/achievements/achievements.repository.ts:100-104`).

Dependencies: EventBusModule (`src/achievements/achievements.module.ts:7-11`).

Database Tables: `achievements`, `user_achievements`.

Public APIs: `GET /api/v1/achievements/me`, `POST /api/v1/achievements/:id/claim`.

Events Consumed: submission, community, review, challenge, featured-builder events.

### Challenges Module

Purpose: Time-boxed challenges and student participation.

Features:

- Mentor/admin create challenge; optional cohort requires manage access (`src/challenges/challenges.service.ts:29-43`).
- Visible challenges include global, member cohort, or mentor cohort challenges (`src/challenges/challenges.repository.ts:17-30`).
- Student join/submit requires active and currently open challenge (`src/challenges/challenges.service.ts:61-137`).
- Challenge list uses cursor pagination and returns `{ data, meta, actions }` (`src/challenges/challenges.service.ts:46-58`).

Dependencies: CohortsModule, EventBusModule (`src/challenges/challenges.module.ts:8-12`).

Database Tables: `challenges`, `challenge_participants`.

Public APIs: `POST /api/v1/challenges`, `GET /api/v1/challenges`, `POST /api/v1/challenges/:id/join`, `POST /api/v1/challenges/:id/submit`.

Events Produced: `CHALLENGE_JOINED`, `CHALLENGE_SUBMITTED`.

### Engagement Module

Purpose: Today Mission generation.

Features:

- Student-only `GET /engagement/today` (`src/engagement/engagement.controller.ts:15-18`).
- Picks next best action from feedback, deadlines, joined challenge, latest assignment, unread announcement, active challenge, or community update fallback (`src/engagement/next-best-action.service.ts:14-149`).
- Emits `TODAYS_MISSION_VIEWED` (`src/engagement/today-mission.service.ts:29-34`).

Dependencies: EventBusModule, StreaksModule, ReputationModule (`src/engagement/engagement.module.ts:10-14`).

Database Tables: reads notifications, assignments, challenges, announcements, submissions, cohorts.

Public APIs: `GET /api/v1/engagement/today`.

Events Produced: `TODAYS_MISSION_VIEWED`.

### Dashboard Module

Purpose: Role-specific dashboard aggregation.

Features:

- `GET /dashboard/me` emits `DASHBOARD_OPENED` and dispatches by role (`src/dashboard/dashboard.service.ts:18-33`).
- Student dashboard aggregates mission, streak, reputation, assignments, feedback, challenges, feed, achievements, activity, momentum, featured builders (`src/dashboard/student-dashboard.service.ts:28-106`).
- Mentor dashboard aggregates pending submissions, recent submissions, cohort momentum, students at risk, recognition candidates (`src/dashboard/mentor-action-center.service.ts:14-73`).
- Admin dashboard aggregates active users, activity, completion rate, cohort/notification counts (`src/dashboard/admin-engagement-dashboard.service.ts:9-49`).

Dependencies: Engagement, Streaks, Reputation, Activity, CohortMomentum, FeaturedBuilders, EventBus (`src/dashboard/dashboard.module.ts:15-31`).

Database Tables: many read-only aggregate queries.

Public APIs: `GET /api/v1/dashboard/me`.

Events Produced: `DASHBOARD_OPENED`.

### Featured Builders Module

Purpose: Select and display weekly featured builders.

Features:

- Authenticated users can fetch current featured builders (`src/featured-builders/featured-builders.controller.ts:12-14`).
- Fetching triggers weekly auto-selection if none exists this week (`src/featured-builders/featured-builder.service.ts:14-30`, `src/featured-builders/featured-builder.service.ts:60-95`).
- Top candidate score is backend computed from reputation, streak, achievements, and challenge submissions (`src/featured-builders/featured-builder.service.ts:97-135`).

Dependencies: EventBusModule (`src/featured-builders/featured-builders.module.ts:6-10`).

Database Tables: `featured_builders`.

Public APIs: `GET /api/v1/featured-builders`.

Events Produced: `FEATURED_BUILDER_SELECTED`.

### Cohort Momentum Module

Purpose: Derived cohort engagement metrics.

Features:

- Subscribes to engagement events and refreshes daily/weekly/monthly summaries (`src/cohort-momentum/cohort-momentum.service.ts:7-28`, `src/cohort-momentum/cohort-momentum.service.ts:118-128`).
- Student dashboard uses daily momentum for the user's first cohort (`src/cohort-momentum/cohort-momentum.service.ts:30-49`).

Dependencies: EventBusModule.

Database Tables: `cohort_momentum_summaries`.

Public APIs: none.

Events Consumed: `SUBMISSION_CREATED`, `SUBMISSION_REVIEWED`, `COMMUNITY_POST_CREATED`, `COMMUNITY_POST_REACTED`, `COMMENT_CREATED`, `CHALLENGE_JOINED`, `CHALLENGE_SUBMITTED`, `DASHBOARD_OPENED`, `TODAYS_MISSION_VIEWED`.

### User Progress Snapshots Module

Purpose: Derived user progress snapshots.

Features:

- Subscribes to events and refreshes daily/weekly snapshots (`src/user-progress-snapshots/user-progress-snapshot.service.ts:15-17`, `src/user-progress-snapshots/user-progress-snapshot.service.ts:94-103`).
- Metrics include streak, best streak, reputation, level, achievements, submissions, activity, challenge participation (`src/user-progress-snapshots/user-progress-snapshot.service.ts:24-71`).

Dependencies: EventBusModule.

Database Tables: `user_progress_snapshots`.

Public APIs: none.

Events Consumed: all events with `userId`.

### Notification Orchestrator Module

Purpose: Convert domain events to in-app and push notifications.

Features:

- Subscribes on module init (`src/notification-orchestrator/notification-orchestrator.service.ts:33-35`).
- Resolves notification intent for assignment, announcement, feedback, community, challenge, and featured-builder events (`src/notification-orchestrator/notification-orchestrator.service.ts:81-203`).
- Applies preferences, dedupe, in-app provider, FCM provider, or queues schedule rows (`src/notification-orchestrator/notification-orchestrator.service.ts:43-78`).

Dependencies: EventBusModule, NotificationsModule, PushTokensModule, FirebaseModule (`src/notification-orchestrator/notification-orchestrator.module.ts:12-26`).

Database Tables: `notifications`, `notification_preferences`, `notification_schedules`, `push_tokens`.

Public APIs: none.

Events Consumed: notification-worthy domain events.

### Firebase Module

Purpose: Firebase Admin client for FCM.

Features:

- Requires `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` when first messaging call initializes Firebase (`src/firebase/firebase-admin.service.ts:24-31`).
- Reuses existing Firebase app if present (`src/firebase/firebase-admin.service.ts:18-21`).

Dependencies: firebase-admin package.

Database Tables: none.

Public APIs: none.

## Missing/Inconsistent Implementations Summary

Details are in `docs/BACKEND_GAP_ANALYSIS.md`.

- No refresh token lifecycle despite JWT auth.
- JWT has dev fallback secret if `JWT_SECRET` is missing.
- Notification schedule rows are created but no worker delivers them.
- No notification preference API even though preferences are modeled and used.
- No multipart file upload implementation.
- No WebSocket implementation.
- No email provider implementation.
- Admin visibility/list behavior is inconsistent across resources.
- Some read/list endpoints expose raw Prisma shapes instead of response DTOs.
- Comments on submissions do not enforce cohort/assignment visibility before creating comments.
- Tests cover selected hook-engine and push paths, but most API/auth/validation paths lack integration tests.
