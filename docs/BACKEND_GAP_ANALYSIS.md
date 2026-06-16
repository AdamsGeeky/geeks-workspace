# Backend Gap Analysis

This document lists missing, incomplete, or inconsistent backend implementations found in source.

## Critical

### Production JWT Secret Fallback

Status: Implemented with unsafe fallback.

Issue: JWT signing and verification both fall back to `dev-only-change-me` when `JWT_SECRET` is not set.

Sources:

- `src/auth/auth.service.ts:89-90`
- `src/common/guards/jwt-auth.guard.ts:29-32`

Impact: If production runs without `JWT_SECRET`, tokens are forgeable by anyone who knows the fallback.

Recommendation: Require `JWT_SECRET` at startup and fail fast if missing.

### Notification Schedule Has No Delivery Worker

Status: Partially implemented.

Issue: Quiet-hours/daily-limit decisions create `notification_schedules` rows, but no cron, queue worker, or scheduler consumes pending schedules.

Sources:

- Queue creation: `src/notification-orchestrator/notification-preference.service.ts:47-61`
- No cron/queue/websocket package or decorator found in source search.

Impact: Queued notifications can remain pending forever.

Recommendation: Add a scheduler module that claims due `PENDING` rows, sends via in-app/push/email providers, and marks `SENT`/`FAILED`.

## High

### No Refresh Token Or Revocation Flow

Status: Missing.

Issue: Auth returns only `accessToken`; no refresh token model/table/endpoint is implemented.

Sources:

- Auth response only includes `user` and `accessToken` (`src/auth/auth.service.ts:44-47`, `src/auth/auth.service.ts:66-69`).
- JWT expiration is fixed by env/default (`src/auth/auth.service.ts:89-90`).

Impact: Frontend must force re-login after expiry; stolen tokens cannot be revoked server-side.

Recommendation: Add refresh token rotation with hashed token storage and logout/revoke endpoint.

### Submission Comment Authorization Gap

Status: Implemented without access check.

Issue: Creating a comment on a submission checks that the submission exists, but does not check whether the actor can view or manage the submission.

Source: `src/comments/comments.service.ts:39-48`.

Impact: Any authenticated user who knows a submission UUID can comment on it.

Recommendation: Reuse assignment/cohort access checks before allowing submission comments.

### Admin List Scope Inconsistencies

Status: Inconsistent.

Issue: Some list endpoints are globally admin-capable while others are scoped by current user and do not special-case admin.

Examples:

- Admin can list all users (`src/users/users.controller.ts:16-19`).
- Admin can list all activity (`src/activity/activity.controller.ts:21-24`).
- `GET /submissions` only returns actor's student submissions or mentored cohort submissions; admin is not special-cased (`src/submissions/submissions.repository.ts:49-59`).
- `GET /materials` only returns member/mentor materials (`src/materials/materials.repository.ts:13-22`).
- `GET /assignments` only returns member published, mentored, or created assignments (`src/assignments/assignments.repository.ts:17-30`).
- `GET /announcements` has a redundant admin branch but calls the same scoped repository (`src/announcements/announcements.service.ts:55-61`).

Impact: Admin frontend screens cannot assume global list APIs exist.

Recommendation: Add explicit admin endpoints or make existing list services role-aware.

### No Notification Preferences API

Status: Persistence and logic implemented, public API missing.

Issue: `notification_preferences` table and preference filtering exist, but there is no controller to read/update preferences.

Sources:

- Schema: `prisma/schema.prisma:542-556`.
- Filtering: `src/notification-orchestrator/notification-preference.service.ts:25-82`.

Impact: Users cannot manage quiet hours, push/email/in-app settings, or daily push limits.

Recommendation: Add authenticated `GET/PATCH /notification-preferences/me`.

### No Actual File Upload System

Status: Metadata only.

Issue: File API accepts filename/mime/size/url metadata; no multipart upload, storage signing, or file processing is implemented.

Sources:

- Controller only accepts DTO body (`src/files/files.controller.ts:13-15`).
- Service stores URL metadata (`src/files/files.service.ts:10-19`).

Impact: Frontend needs an external upload path not documented by backend.

Recommendation: Implement presigned uploads or document external storage contract.

## Medium

### Email Provider Interface Without Implementation

Status: Interface only.

Issue: `EmailProvider` interface exists but no concrete provider is wired.

Source: `src/notification-orchestrator/notification-channel-provider.interface.ts:20-22`.

Impact: `emailEnabled` preference has no delivery effect.

Recommendation: Add email provider or remove email setting until supported.

### Public Registration DTO Exposes Role

Status: Inconsistent contract.

Issue: `RegisterDto` allows optional `role`, but service rejects any non-student role.

Sources:

- DTO: `src/common/dto.ts:45-48`.
- Service: `src/auth/auth.service.ts:24-29`.

Impact: Generated clients may imply mentor/admin registration is possible.

Recommendation: Split public register DTO from admin user creation/update DTO.

### Challenge Date Ordering Not Validated

Status: Missing validation.

Issue: `CreateChallengeDto` validates `startsAt` and `endsAt` as date strings but does not enforce `startsAt < endsAt`.

Source: `src/challenges/dto/create-challenge.dto.ts:26-32`; service directly persists dates in `src/challenges/challenges.service.ts:34-43`.

Impact: Invalid challenges can be created and later never become open or behave unexpectedly.

Recommendation: Add service validation for chronological ordering.

### Assignment Deadline Semantics Are Minimal

Status: Minimal.

Issue: Deadline is stored and used in dashboard ordering/risk calculations, but submission creation does not block after deadline or when assignment is `CLOSED`.

Sources:

- Submission only checks assignment visibility (`src/submissions/submissions.service.ts:26-29`).
- Assignment visibility for students checks published status in list, but `assertCanViewAssignment` only checks cohort access (`src/assignments/assignments.service.ts:80-87`).

Impact: Students may submit to closed/unpublished assignments if they know the id and have cohort access.

Recommendation: Add submission eligibility checks for `PUBLISHED`, not `CLOSED`, and deadline policy.

### Achievement Claim Has No Explicit Not Found/Not Unlocked Error

Status: Minimal.

Issue: Claim uses `updateMany` and returns the full list even when no row changed.

Sources:

- `src/achievements/achievements.service.ts:41-43`
- `src/achievements/achievements.repository.ts:100-104`

Impact: Frontend cannot distinguish already claimed, locked, or invalid achievement id.

Recommendation: Return mutation count or throw for invalid/locked claim.

### Notification Mark Read Has No Explicit Not Found

Status: Minimal.

Issue: `markRead` uses `updateMany` and returns `{ count }`; no not-found exception is thrown.

Source: `src/notifications/notifications.repository.ts:61-65`.

Impact: Frontend must inspect `count` to know whether anything changed.

Recommendation: Either keep count contract documented or return updated entity / 404.

### Featured Builders GET Has Write Side Effect

Status: Implemented but surprising.

Issue: Fetching current featured builders can auto-create a weekly selection and emit an event.

Source: `src/featured-builders/featured-builder.service.ts:14-30`, `src/featured-builders/featured-builder.service.ts:60-95`.

Impact: Repeated reads near week boundaries may cause user-visible state changes.

Recommendation: Move selection to scheduled job or explicit admin action.

## Low

### Root Endpoint Is Still Hello World

Status: Placeholder.

Issue: `GET /api/v1` returns `"Hello World!"`.

Source: `src/app.service.ts:3-7`.

Impact: Health checks may be acceptable, but it is not a structured health endpoint.

Recommendation: Replace with `/health` returning version/status.

### Duplicate Migration Tree

Status: Repository hygiene issue.

Issue: There is a top-level `migrations/` directory and a Prisma `prisma/migrations/` directory.

Sources:

- `migrations/20260508233938_init/migration.sql`
- `prisma/migrations/20260509083855_init/migration.sql`

Impact: Developers may run the wrong migration path.

Recommendation: Keep only the Prisma migration path or document legacy folder.

### Sparse API Test Coverage

Status: Partial.

Issue: Tests cover root endpoint, push tokens, FCM provider, and selected hook-engine logic, but most controller/auth/validation/authorization paths lack e2e coverage.

Sources:

- `test/app.e2e-spec.ts:19-23`
- `src/push-tokens/push-tokens.spec.ts`
- `src/notification-orchestrator/fcm-push.provider.spec.ts`
- `src/hook-engine-completion.spec.ts:20-287`

Impact: Contract regressions can reach frontend unnoticed.

Recommendation: Add e2e tests for every public endpoint, role matrix, and DTO validation failure.
