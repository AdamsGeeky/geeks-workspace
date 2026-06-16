# Database Schema Reference

Primary source: `prisma/schema.prisma`.

Datasource: PostgreSQL (`prisma/schema.prisma:12-14`).

Generated client output: `../generated/prisma` (`prisma/schema.prisma:6-10`).

Soft delete: no Prisma models define `deletedAt`; no soft-delete rules are implemented.

Audit fields: most mutable entities have `createdAt` and `updatedAt`; some join/event tables only have created/read/submitted timestamps.

## Enums

| Enum | Values | Source |You are a Principal Software Engineer, Staff Backend Architect, and Technical Documentation Expert.

Your task is to perform a complete backend implementation audit and generate a comprehensive Frontend Integration Specification document.

The backend is the single source of truth.

Do not make assumptions. Derive everything from the actual codebase.

Objective

Analyze the entire backend codebase and produce a professional engineering document that explains:

What has already been implemented.
What APIs exist.
What business logic exists.
What validation rules exist.
What permissions and authorization rules exist.
What frontend developers should consume.
What frontend developers must never assume.
What data contracts must be respected.
Missing implementations and inconsistencies.
Backend vs Frontend responsibilities.

The final output should be detailed enough that a frontend engineer can build the complete UI without needing to inspect backend code.

Scope of Analysis

Inspect all:

Routes
Controllers
Services
Repositories
Models
Database Schemas
ORM Definitions
Migrations
Middleware
Validation Schemas
Authentication Logic
Authorization Logic
Event Handlers
Message Queues
Background Jobs
Cron Jobs
WebSocket Implementations
File Upload Systems
Email Systems
Notification Systems
Third-party Integrations
Feature Flags
Environment Variables
API Documentation
Test Suites
Phase 1 — Architecture Analysis

Generate:

System Overview

Describe:

Application purpose
Domain boundaries
Modules
Service architecture
Dependency flow
Request lifecycle

Include diagrams in markdown.

Example:

Client
 ↓
API Gateway
 ↓
Auth Middleware
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
Database
Phase 2 — Module Inventory

For every module provide:

Module Name

Purpose:

Features:

Dependencies:

Database Tables:

Public APIs:

Internal Services:

Events Produced:

Events Consumed:

Example:

# Student Module

Purpose:
Manage students within cohorts.

Features:
- Create Student
- Update Student
- Delete Student
- Assign Mentor

Database Tables:
- students
- student_profiles

Dependencies:
- Auth Module
- Cohort Module
Phase 3 — API Contract Documentation

For EVERY endpoint generate:

Endpoint

Method:

Route:

Authentication Required:

Roles Allowed:

Purpose:

Request Headers:

Request Body:

Path Params:

Query Params:

Validation Rules:

Success Response:

Error Responses:

Business Rules:

Frontend Notes:

Example:

POST /api/students

Authentication:
Required

Roles:
Admin
Mentor

Request:
{
  "name": "John Doe",
  "email": "john@example.com"
}

Validation:
- name required
- email unique

Response:
{
  "id": "uuid",
  "name": "John Doe"
}
Phase 4 — Frontend Source of Truth

Create a dedicated section called:

FRONTEND IMPLEMENTATION GUIDE

For each feature explain:

Data Ownership

Who owns the state?

Backend
Frontend
Shared

Example:

Student Status

Source of Truth:
Backend

Frontend Must:
Display status

Frontend Must Not:
Calculate status locally
Allowed UI Actions

List:

Create
Read
Update
Delete
Archive
Publish
Approve
Reject

Include role restrictions.

Frontend Business Rules

Document:

Required fields
Conditional fields
Hidden fields
Disabled states
Loading states
Error states
Empty states
Frontend Validation Rules

Generate a table:

Field	Required	Min	Max	Pattern

Only include validations found in backend code.

Never invent rules.

Phase 5 — Authentication & Authorization

Document:

Authentication Flow

Explain:

JWT
Cookies
Sessions
Refresh Tokens
OAuth

Show complete login lifecycle.

Role Matrix

Generate table:

Feature	Admin	Mentor	Student	Parent

Include:

View
Create
Edit
Delete
Export
Manage
Phase 6 — Database Contract

For every entity provide:

Entity

Purpose

Fields

Relationships

Constraints

Indexes

Generated Fields

Computed Fields

Soft Delete Rules

Audit Fields

Example:

Student

Fields:
- id
- name
- email

Relations:
- cohort_id -> cohorts.id

Constraints:
- email unique
Phase 7 — Frontend Types Generation

Generate:

TypeScript Interfaces

For every API response.

Example:

interface Student {
  id: string;
  name: string;
  email: string;
}

Generate:

DTOs
Request Types
Response Types
Enum Types
Phase 8 — State Management Guide

For every feature define:

Query Keys

Example:

["students"]
["students", id]
["students", cohortId]
Cache Strategy

Document:

staleTime
gcTime
invalidations
optimistic updates

For:

TanStack Query
React Query
Phase 9 — Missing or Incomplete Features

Generate:

Backend Gaps

List:

Feature:
Status:
Impact:
Recommendation:

Example:

Mentor Assignment Notifications

Status:
Partially Implemented

Issue:
Database records created but notifications never sent.

Impact:
Users unaware of assignments.
Phase 10 — Frontend Readiness Report

Generate a final executive report:

Completed Features

Percentage Complete

Partially Complete Features

Percentage Complete

Missing Features

Percentage Complete

Production Risks
Security Risks
Scalability Risks
Technical Debt
Recommendations

Priority Levels:

Critical
High
Medium
Low
Output Requirements

Generate the following files:

docs/

├── BACKEND_AUDIT.md
├── FRONTEND_INTEGRATION_GUIDE.md
├── API_CONTRACTS.md
├── AUTHORIZATION_MATRIX.md
├── DATABASE_SCHEMA_REFERENCE.md
├── TYPESCRIPT_TYPES.md
├── QUERY_KEYS_AND_CACHING.md
├── BACKEND_GAP_ANALYSIS.md
└── FRONTEND_READINESS_REPORT.md

Rules:

Use the actual codebase as the source of truth.
Never invent endpoints.
Never invent validation rules.
Never invent business logic.
Cite the exact source files for every finding.
Include file paths and line references wherever possible.
Prefer accuracy over completeness.
Produce documentation at Staff/Principal Engineer quality suitable for onboarding senior frontend engineers and technical leads.
|---|---|---|
| `UserRole` | `STUDENT`, `MENTOR`, `ADMIN` | `prisma/schema.prisma:16-20` |
| `AssignmentStatus` | `DRAFT`, `PUBLISHED`, `CLOSED` | `prisma/schema.prisma:22-26` |
| `SubmissionStatus` | `SUBMITTED`, `UNDER_REVIEW`, `COMPLETED`, `NEEDS_REVISION`, `REJECTED` | `prisma/schema.prisma:28-34` |
| `ReactionType` | `LIKE`, `FIRE`, `CLAP`, `INSPIRE` | `prisma/schema.prisma:36-41` |
| `NotificationType` | `ANNOUNCEMENT`, `ASSIGNMENT`, `SUBMISSION_FEEDBACK`, `COMMUNITY`, `SYSTEM` | `prisma/schema.prisma:43-49` |
| `FileOwnerType` | `USER`, `MATERIAL`, `ASSIGNMENT`, `SUBMISSION`, `COMMUNITY_POST` | `prisma/schema.prisma:51-57` |
| `DomainEventType` | Assignment/submission/community/comment/announcement/streak/achievement/challenge/featured/dashboard/mission events | `prisma/schema.prisma:59-79` |
| `StreakType` | `BUILD` | `prisma/schema.prisma:81-83` |
| `ReputationCategory` | `SUBMISSION`, `COMMUNITY`, `MENTOR` | `prisma/schema.prisma:85-89` |
| `AchievementType` | `SUBMISSION`, `COMMUNITY`, `STREAK`, `MENTOR`, `CHALLENGE`, `RECOGNITION` | `prisma/schema.prisma:91-98` |
| `ChallengeStatus` | `DRAFT`, `ACTIVE`, `ENDED`, `CANCELLED` | `prisma/schema.prisma:100-105` |
| `ChallengeParticipantStatus` | `JOINED`, `SUBMITTED`, `COMPLETED`, `WITHDRAWN` | `prisma/schema.prisma:107-112` |
| `NotificationScheduleStatus` | `PENDING`, `SENT`, `CANCELLED`, `FAILED` | `prisma/schema.prisma:114-119` |
| `MomentumPeriod` | `DAILY`, `WEEKLY`, `MONTHLY` | `prisma/schema.prisma:121-125` |
| `PushPlatform` | `IOS`, `ANDROID`, `WEB` | `prisma/schema.prisma:127-131` |

## Entities

### User

Table: `users`.

Purpose: Authenticated platform user.

Fields: `id`, `fullName`, `email`, `passwordHash`, `role`, `avatarUrl`, `bio`, `createdAt`, `updatedAt` (`prisma/schema.prisma:133-142`).

Relationships: cohorts mentored, memberships, announcements, materials, assignments, submissions, reviewed submissions, posts, comments, reactions, notifications, files, activity events, streaks, reputation, achievements, challenges, featured builder rows, preferences, schedules, push tokens, snapshots (`prisma/schema.prisma:143-169`).

Constraints/Indexes:

- `id` UUID primary key.
- `email` unique (`prisma/schema.prisma:136`).

Generated Fields:

- `id` default uuid.
- `role` default `STUDENT`.
- `createdAt` default now.
- `updatedAt` auto-updated.

Frontend Contract:

- `passwordHash` must never be consumed; safe responses remove it through presenter (`src/users/user.presenter.ts:3-8`).

### Cohort

Table: `cohorts`.

Fields: `id`, `name`, `description`, `mentorId`, `createdAt`, `updatedAt` (`prisma/schema.prisma:174-190`).

Relationships: optional mentor, members, announcements, materials, assignments, activity events, challenges, featured builders, momentum summaries, progress snapshots.

Constraints:

- `mentorId` references `users.id`, on delete set null (`prisma/schema.prisma:178-179`).

### CohortMember

Table: `cohort_members`.

Fields: `id`, `cohortId`, `userId`, `createdAt` (`prisma/schema.prisma:195-201`).

Relationships: cohort/user cascade delete (`prisma/schema.prisma:199-200`).

Constraints:

- Unique `(cohortId, userId)` (`prisma/schema.prisma:203`).

### Announcement

Table: `announcements`.

Fields: `id`, `title`, `content`, `cohortId`, `isGlobal`, `createdBy`, `createdAt`, `updatedAt` (`prisma/schema.prisma:207-218`).

Relationships: optional cohort cascade delete, creator restrict delete, reads.

Generated Fields:

- `isGlobal` default false.

### AnnouncementRead

Table: `announcement_reads`.

Fields: `id`, `announcementId`, `userId`, `readAt` (`prisma/schema.prisma:223-229`).

Constraints:

- Unique `(announcementId, userId)` (`prisma/schema.prisma:231`).
- Index `(userId, announcementId)` (`prisma/schema.prisma:232`).

### Material

Table: `materials`.

Fields: `id`, `title`, `description`, `url`, `fileUrl`, `cohortId`, `createdBy`, `createdAt`, `updatedAt` (`prisma/schema.prisma:236-247`).

Relationships: cohort cascade delete, creator restrict delete.

### Assignment

Table: `assignments`.

Fields: `id`, `title`, `description`, `deadline`, `cohortId`, `createdBy`, `status`, `createdAt`, `updatedAt` (`prisma/schema.prisma:252-264`).

Relationships: cohort cascade, creator restrict, submissions.

Constraints/Indexes:

- Index `(cohortId, status, deadline)` (`prisma/schema.prisma:266`).

Generated Fields:

- `status` default `DRAFT`.

### Submission

Table: `submissions`.

Fields: `id`, `assignmentId`, `studentId`, `githubUrl`, `fileUrl`, `note`, `status`, `feedback`, `reviewedBy`, `submittedAt`, `reviewedAt`, `createdAt`, `updatedAt` (`prisma/schema.prisma:270-283`).

Relationships: assignment cascade, student cascade, reviewer set null, comments.

Constraints/Indexes:

- Unique `(assignmentId, studentId)` (`prisma/schema.prisma:289`).
- Index `(studentId, status, createdAt)` (`prisma/schema.prisma:290`).
- Index `(assignmentId, status)` (`prisma/schema.prisma:291`).

Generated Fields:

- `status` default `SUBMITTED`.
- `submittedAt` default now.

### CommunityPost

Table: `community_posts`.

Fields: `id`, `authorId`, `content`, `imageUrl`, `createdAt`, `updatedAt` (`prisma/schema.prisma:295-304`).

Relationships: author cascade, comments, reactions.

Indexes: `createdAt` (`prisma/schema.prisma:306`).

### Comment

Table: `comments`.

Fields: `id`, `authorId`, `postId`, `submissionId`, `content`, `createdAt`, `updatedAt` (`prisma/schema.prisma:310-320`).

Relationships: author cascade, optional post cascade, optional submission cascade.

Indexes: `(postId, createdAt)` (`prisma/schema.prisma:322`).

Contract Note:

- Database allows both `postId` and `submissionId` to be null or both set; service enforces exactly one on create (`src/comments/comments.service.ts:23-26`).

### Reaction

Table: `reactions`.

Fields: `id`, `userId`, `postId`, `type`, `createdAt` (`prisma/schema.prisma:326-333`).

Constraints:

- Unique `(userId, postId, type)` (`prisma/schema.prisma:335`).
- Index `(postId, type)` (`prisma/schema.prisma:336`).

### Notification

Table: `notifications`.

Fields: `id`, `userId`, `title`, `message`, `type`, `fingerprint`, `isRead`, `createdAt`, `updatedAt` (`prisma/schema.prisma:340-350`).

Generated Fields:

- `isRead` default false.

Indexes:

- `(userId, isRead, createdAt)` (`prisma/schema.prisma:352`).
- `(userId, fingerprint, createdAt)` (`prisma/schema.prisma:353`).

### FileAsset

Table: `files`.

Fields: `id`, `filename`, `mimeType`, `size`, `url`, `ownerType`, `ownerId`, `uploadedBy`, `createdAt` (`prisma/schema.prisma:357-367`).

Relationships: uploader restrict delete.

Contract Note:

- `ownerId` is not a foreign key; frontend must not assume referential integrity.

### ActivityEvent

Table: `activity_events`.

Fields: `id`, `userId`, `cohortId`, `eventType`, `entityType`, `entityId`, `metadata`, `occurredAt`, `createdAt` (`prisma/schema.prisma:372-381`).

Relationships: user/cohort set null, streak entries, reputation events.

Indexes:

- `(userId, occurredAt)`, `(eventType, occurredAt)`, `(cohortId, occurredAt)`, `(entityType, entityId)` (`prisma/schema.prisma:387-390`).

### UserStreak

Table: `user_streaks`.

Fields: `id`, `userId`, `type`, `currentCount`, `bestCount`, `lastActivityAt`, `createdAt`, `updatedAt` (`prisma/schema.prisma:394-402`).

Constraints:

- Unique `(userId, type)` (`prisma/schema.prisma:405`).

Generated Fields:

- `currentCount` and `bestCount` default 0.

### StreakEntry

Table: `streak_entries`.

Fields: `id`, `userId`, `streakType`, `date`, `sourceEventId`, `createdAt` (`prisma/schema.prisma:409-416`).

Constraints:

- Unique `(userId, streakType, date)` (`prisma/schema.prisma:419`).

### ReputationScore

Table: `reputation_scores`.

Fields: `id`, `userId`, `score`, `level`, `submissionPoints`, `communityPoints`, `mentorPoints`, `createdAt`, `updatedAt` (`prisma/schema.prisma:423-432`).

Constraints/Indexes:

- Unique `userId` (`prisma/schema.prisma:425`).
- Index `score`, `level` (`prisma/schema.prisma:435-436`).

Generated Fields:

- `score` default 0.
- `level` default `Explorer`.

### ReputationEvent

Table: `reputation_events`.

Fields: `id`, `userId`, `sourceEventId`, `points`, `reason`, `category`, `createdAt` (`prisma/schema.prisma:440-447`).

Indexes:

- `(userId, createdAt)`, `category` (`prisma/schema.prisma:451-452`).

### Achievement

Table: `achievements`.

Fields: `id`, `key`, `title`, `description`, `icon`, `type`, `criteria`, `xpReward`, `isActive`, `createdAt`, `updatedAt` (`prisma/schema.prisma:456-467`).

Constraints:

- `key` unique (`prisma/schema.prisma:458`).

Generated Fields:

- `xpReward` default 0.
- `isActive` default true.

### UserAchievement

Table: `user_achievements`.

Fields: `id`, `userId`, `achievementId`, `unlockedAt`, `claimedAt`, `createdAt` (`prisma/schema.prisma:473-479`).

Constraints:

- Unique `(userId, achievementId)` (`prisma/schema.prisma:483`).

### Challenge

Table: `challenges`.

Fields: `id`, `title`, `description`, `cohortId`, `startsAt`, `endsAt`, `rewardConfig`, `status`, `createdBy`, `createdAt`, `updatedAt` (`prisma/schema.prisma:487-501`).

Indexes:

- `(cohortId, status)`, `(startsAt, endsAt)` (`prisma/schema.prisma:503-504`).

Generated Fields:

- `status` default `DRAFT` at DB level; service defaults create DTO to `ACTIVE` (`src/challenges/challenges.service.ts:34-43`).

### ChallengeParticipant

Table: `challenge_participants`.

Fields: `id`, `challengeId`, `userId`, `status`, `submissionUrl`, `note`, `submittedAt`, `createdAt`, `updatedAt` (`prisma/schema.prisma:508-517`).

Constraints:

- Unique `(challengeId, userId)` (`prisma/schema.prisma:521`).

Generated Fields:

- `status` default `JOINED`.

### FeaturedBuilder

Table: `featured_builders`.

Fields: `id`, `userId`, `cohortId`, `reason`, `selectedBy`, `featuredAt`, `createdAt` (`prisma/schema.prisma:525-532`).

Indexes:

- `(cohortId, featuredAt)`, `(userId, featuredAt)` (`prisma/schema.prisma:537-538`).

### NotificationPreference

Table: `notification_preferences`.

Fields: `id`, `userId`, `pushEnabled`, `emailEnabled`, `inAppEnabled`, `quietHoursStart`, `quietHoursEnd`, `maxDailyPush`, `createdAt`, `updatedAt` (`prisma/schema.prisma:542-552`).

Constraints:

- Unique `userId` (`prisma/schema.prisma:544`).

Generated Fields:

- `pushEnabled` true, `emailEnabled` false, `inAppEnabled` true, `maxDailyPush` 5.

API Gap:

- No public API exists to read or update preferences.

### NotificationSchedule

Table: `notification_schedules`.

Fields: `id`, `userId`, `triggerType`, `scheduledFor`, `payload`, `status`, `createdAt`, `updatedAt` (`prisma/schema.prisma:558-566`).

Indexes:

- `(scheduledFor, status)`, `(userId, scheduledFor)` (`prisma/schema.prisma:569-570`).

Generated Fields:

- `status` default `PENDING`.

Implementation Gap:

- Rows are queued, but no scheduler consumes them.

### PushToken

Table: `push_tokens`.

Fields: `id`, `userId`, `token`, `platform`, `isActive`, `lastSeenAt`, `createdAt`, `updatedAt` (`prisma/schema.prisma:574-582`).

Constraints/Indexes:

- `token` unique (`prisma/schema.prisma:577`).
- Index `(userId, isActive)` (`prisma/schema.prisma:585`).

### CohortMomentumSummary

Table: `cohort_momentum_summaries`.

Fields: `id`, `cohortId`, `period`, `submissionsCount`, `activeUsersCount`, `postsCount`, `reactionsCount`, `commentsCount`, `metrics`, `createdAt`, `updatedAt` (`prisma/schema.prisma:589-600`).

Constraints:

- Unique `(cohortId, period)` (`prisma/schema.prisma:603`).

### UserProgressSnapshot

Table: `user_progress_snapshots`.

Fields: `id`, `userId`, `cohortId`, `period`, `metrics`, `createdAt`, `updatedAt` (`prisma/schema.prisma:607-614`).

Constraints:

- Unique `(userId, cohortId, period)` (`prisma/schema.prisma:618`).

## Migration Notes

Active Prisma migrations:

- Initial schema at `prisma/migrations/20260509083855_init/migration.sql`.
- Hook engine foundation at `prisma/migrations/20260517180000_hook_engine_foundation/migration.sql`.
- Notification fingerprint at `prisma/migrations/20260607120000_notification_fingerprint/migration.sql`.
- Push tokens at `prisma/migrations/20260608100000_push_tokens/migration.sql`.

There is also a top-level `migrations/20260508233938_init/migration.sql`, which appears to duplicate an earlier initial migration outside the `prisma/migrations` directory.
