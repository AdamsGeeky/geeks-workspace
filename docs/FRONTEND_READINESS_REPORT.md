# Frontend Readiness Report

## Executive Summary

The backend is broad enough for a functional frontend across auth, cohorts, content, submissions, community, dashboards, engagement, notifications, and gamification. However, frontend teams must account for raw Prisma response shapes, uneven admin list behavior, missing preference/file-upload workflows, and missing scheduled notification delivery.

Estimated readiness:

- Completed features: 70%
- Partially complete features: 20%
- Missing or risky features: 10%

These percentages are engineering estimates from implemented code paths, not product commitments.

## Completed Features

| Feature | Completion | Evidence |
|---|---:|---|
| JWT register/login/me | 85% | `src/auth/auth.controller.ts:12-25`, `src/auth/auth.service.ts:24-93` |
| User profile read/update | 80% | `src/users/users.controller.ts:16-33`, `src/users/users.service.ts:21-49` |
| Cohorts and membership | 80% | `src/cohorts/cohorts.controller.ts:20-43`, `src/cohorts/cohort-access.service.ts:14-43` |
| Announcements/read tracking | 80% | `src/announcements/announcements.service.ts:21-85` |
| Materials metadata | 70% | `src/materials/materials.service.ts:14-28` |
| Assignments publish/list | 75% | `src/assignments/assignments.service.ts:17-98` |
| Student submissions/reviews | 75% | `src/submissions/submissions.service.ts:21-105` |
| Community posts/reactions/comments | 70% | `src/community/community.service.ts:15-64`, `src/comments/comments.service.ts:23-77` |
| Activity feed | 80% | `src/activity/activity.service.ts:23-50` |
| Streaks/reputation/achievements | 75% | `src/streaks/streaks.service.ts:25-61`, `src/reputation/reputation.service.ts:47-135`, `src/achievements/achievements.service.ts:14-107` |
| Challenges | 75% | `src/challenges/challenges.service.ts:29-137` |
| Dashboards | 70% | `src/dashboard/dashboard.service.ts:18-33` |
| Push tokens and FCM send | 70% | `src/push-tokens/push-tokens.service.ts:10-21`, `src/notification-orchestrator/fcm-push.provider.ts:22-60` |

## Partially Complete Features

| Feature | Status | Impact |
|---|---|---|
| Notification preferences | Schema and filtering exist, no user-facing API | Frontend cannot build preferences settings |
| Notification scheduling | Rows queued, no delivery worker | Quiet-hours notifications may never send |
| File uploads | Metadata only | Frontend needs separate upload/storage integration |
| Admin operations | Some admin APIs exist, list scopes uneven | Admin UI needs custom handling or new endpoints |
| Swagger/API DTOs | Swagger configured, many responses raw | Generated clients will be incomplete for response contracts |

## Missing Features

| Feature | Impact |
|---|---|
| Refresh tokens/logout/revocation | Weaker auth lifecycle UX/security |
| Password reset/email verification | No account recovery or email trust flow |
| Notification preferences API | No settings UI possible |
| Scheduled notification worker | Queued notification delivery incomplete |
| File upload storage provider | Upload UI cannot complete using backend alone |
| Email provider | `emailEnabled` cannot actually send email |
| WebSocket/live updates | UI must poll or refetch |

## Production Risks

Critical:

- JWT secret fallback must be removed before production (`src/auth/auth.service.ts:89`, `src/common/guards/jwt-auth.guard.ts:31`).

High:

- Scheduled notifications are not delivered.
- Submission comments do not enforce submission visibility.
- Admin list behavior is inconsistent.

Medium:

- Raw Prisma response contracts can shift when repository includes change.
- Featured-builder GET mutates database.
- Challenge start/end date ordering is not enforced.
- Assignment submission eligibility ignores assignment status/deadline beyond cohort access.

## Security Risks

| Risk | Severity | Source |
|---|---|---|
| JWT fallback secret | Critical | `src/auth/auth.service.ts:89`, `src/common/guards/jwt-auth.guard.ts:31` |
| No token revocation | High | Only access token flow exists in `src/auth/auth.service.ts:44-91` |
| Submission comment authorization gap | High | `src/comments/comments.service.ts:39-48` |
| Public file URLs trusted as body input | Medium | `src/files/files.service.ts:10-19` |

## Scalability Risks

- Event bus is in-process and sequential; no external queue or retry semantics (`src/event-bus/domain-event-bus.service.ts:30-39`).
- Dashboard endpoints run many aggregate queries per request (`src/dashboard/student-dashboard.service.ts:28-84`, `src/dashboard/mentor-action-center.service.ts:14-48`).
- Featured-builder selection runs on GET and scans up to 50 users (`src/featured-builders/featured-builder.service.ts:97-135`).
- Cohort momentum refresh runs daily/weekly/monthly recalculations on each relevant event (`src/cohort-momentum/cohort-momentum.service.ts:118-128`).

## Technical Debt

- Shared `src/common/dto.ts` holds many unrelated DTOs across modules.
- Some modules use repositories; dashboard/engagement services query Prisma directly.
- Response DTOs are sparse compared with request DTOs.
- Top-level `migrations/` duplicates Prisma migration concepts.
- Tests are focused on selected services, not full API contracts.

## Recommendations

Critical:

- Require `JWT_SECRET` and remove fallback.
- Add authorization check before commenting on submissions.
- Build scheduled notification delivery worker or disable queueing.

High:

- Add notification preferences API.
- Add refresh token/logout flow.
- Decide admin list semantics and implement consistent admin endpoints.
- Add e2e tests for route auth/role/validation matrix.

Medium:

- Add explicit response DTOs for public APIs.
- Add challenge date ordering validation.
- Add assignment submission eligibility rules.
- Move featured-builder selection out of GET.

Low:

- Replace root `"Hello World!"` with structured health endpoint.
- Consolidate migration directories.
- Add generated OpenAPI client workflow once response DTOs are explicit.
