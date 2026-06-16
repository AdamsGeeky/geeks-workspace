# Frontend Implementation Guide

The backend is the source of truth. Frontend code should consume API responses and current-user role, but must not recompute status, permissions, scores, achievements, or engagement actions locally.

## Global Integration Rules

- Base path is `/api/v1` (`src/main.ts:9`).
- Send `Authorization: Bearer <accessToken>` for all protected endpoints (`src/common/guards/jwt-auth.guard.ts:46-49`).
- Treat validation errors as backend contract failures; unknown body fields are rejected (`src/main.ts:11-17`).
- There are no refresh tokens, cookies, or sessions. Token persistence/expiry handling is a frontend concern.
- Dates returned by Prisma serialize as ISO strings over JSON.
- Many endpoints return raw Prisma model shapes, not explicit response DTOs. Keep client types aligned with documented fields and tolerate additional relation fields where noted.

## Data Ownership

| Feature/Data | Source of Truth | Frontend Must | Frontend Must Not | Source |
|---|---|---|---|---|
| User role | Backend JWT/user record | Render role-specific UI from `/auth/me` | Allow role self-upgrade | `src/users/users.service.ts:39-46` |
| Cohort access | Backend | Use API success/errors | Calculate access only from cached membership | `src/cohorts/cohort-access.service.ts:14-43` |
| Assignment status | Backend | Display `DRAFT/PUBLISHED/CLOSED` | Publish locally without PATCH | `src/assignments/assignments.service.ts:49-78` |
| Submission status | Backend | Display returned status/feedback | Mark reviewed locally | `src/submissions/submissions.service.ts:72-77` |
| Streaks | Backend event subscribers | Display `/streaks/me` | Count streak days locally | `src/streaks/streaks.service.ts:25-46` |
| Reputation | Backend event subscribers | Display returned score/level | Recompute XP/level thresholds in UI | `src/reputation/reputation.service.ts:74-135` |
| Achievements | Backend event subscribers | Display unlock/claim state | Unlock achievements locally | `src/achievements/achievements.service.ts:46-107` |
| Today Mission | Backend | Render `primaryAction` | Choose own priority action | `src/engagement/next-best-action.service.ts:14-149` |
| Dashboard | Backend | Switch on `data.role` | Assume one dashboard shape | `src/dashboard/dashboard.service.ts:26-32` |
| Notifications | Backend | Display returned rows | Infer dedupe/quiet-hours behavior | `src/notification-orchestrator/notification-orchestrator.service.ts:43-78` |
| Featured builder | Backend | Display returned builders | Rank/select locally | `src/featured-builders/featured-builder.service.ts:97-135` |

## Feature Guides

### Authentication

Allowed UI Actions:

- Register student.
- Login.
- Fetch current user.
- Logout locally by clearing token.

Role Restrictions:

- Public registration only supports students (`src/auth/auth.service.ts:24-29`).

Frontend States:

- Loading: while posting login/register or fetching `/auth/me`.
- Error: invalid credentials (`401 Invalid email or password`), duplicate email (`409 Email is already registered`), validation errors.
- Empty: unauthenticated/no token.

Frontend Validation:

| Field | Required | Min | Max | Pattern/Type | Source |
|---|---:|---:|---:|---|---|
| fullName | Yes | None | None | string, not empty | `src/common/dto.ts:30-34` |
| email | Yes | None | None | email | `src/common/dto.ts:36-38`, `src/common/dto.ts:51-54` |
| password | Yes | None | None | string, not empty | `src/common/dto.ts:40-43`, `src/common/dto.ts:56-59` |
| role | No | None | None | `UserRole`; only `STUDENT` accepted publicly | `src/common/dto.ts:45-48`, `src/auth/auth.service.ts:24-29` |

### Users

Allowed UI Actions:

- View own profile: all roles.
- Edit own profile: all roles.
- List all users: admin only.
- Edit another user/role: admin only.

Disabled/Hidden States:

- Hide role selector for non-admins because backend ignores non-admin role changes (`src/users/users.service.ts:39-46`).
- Disable profile save while PATCH is pending.

Frontend Validation:

| Field | Required | Min | Max | Pattern/Type | Source |
|---|---:|---:|---:|---|---|
| fullName | No | None | None | string | `src/common/dto.ts:62-66` |
| avatarUrl | No | None | None | URL | `src/common/dto.ts:68-71` |
| bio | No | None | None | string | `src/common/dto.ts:73-76` |
| role | No | None | None | `UserRole` | `src/common/dto.ts:78-81` |

### Cohorts

Allowed UI Actions:

- List cohorts: all authenticated users.
- Create cohort: admin.
- View cohort detail: admin, assigned mentor, cohort member.
- Add student: admin or assigned mentor.

Frontend Must:

- Use returned members/mentor for display.
- Handle `403 You do not belong to this cohort`.

Frontend Must Not:

- Assume `GET /cohorts` is scoped; code returns all cohorts (`src/cohorts/cohorts.repository.ts:13-17`).

Frontend Validation:

| Field | Required | Min | Max | Pattern/Type | Source |
|---|---:|---:|---:|---|---|
| name | Yes | None | None | string, not empty | `src/common/dto.ts:84-88` |
| description | No | None | None | string | `src/common/dto.ts:90-93` |
| mentorId | No | None | None | UUID | `src/common/dto.ts:95-98` |
| studentId | Yes | None | None | UUID | `src/common/dto.ts:101-104` |

### Announcements

Allowed UI Actions:

- Create cohort announcement: assigned mentor or admin.
- Create global announcement: admin only.
- Mark read: any user who can view announcement.

Frontend Rules:

- If `isGlobal` is false or omitted, require `cohortId`.
- If `isGlobal` is true, hide from mentors because backend rejects non-admins.
- Use `reads.length > 0` from list response as read state; list includes current user's reads (`src/announcements/announcements.repository.ts:22`).

Frontend Validation:

| Field | Required | Min | Max | Pattern/Type | Source |
|---|---:|---:|---:|---|---|
| title | Yes | None | None | string, not empty | `src/common/dto.ts:107-111` |
| content | Yes | None | None | string, not empty | `src/common/dto.ts:113-116` |
| cohortId | Conditional | None | None | UUID | `src/common/dto.ts:118-121`, `src/announcements/announcements.service.ts:21-24` |
| isGlobal | No | None | None | boolean | `src/common/dto.ts:123-126` |

### Materials

Allowed UI Actions:

- Create material: admin or assigned mentor.
- List visible materials: all authenticated users.

Frontend Rules:

- Backend stores either `url`, `fileUrl`, both, or neither if validation passes; no service rule requires one of them.

Frontend Validation:

| Field | Required | Min | Max | Pattern/Type | Source |
|---|---:|---:|---:|---|---|
| title | Yes | None | None | string, not empty | `src/common/dto.ts:129-133` |
| description | No | None | None | string | `src/common/dto.ts:135-138` |
| url | No | None | None | URL | `src/common/dto.ts:140-143` |
| fileUrl | No | None | None | URL | `src/common/dto.ts:145-148` |
| cohortId | Yes | None | None | UUID | `src/common/dto.ts:150-152` |

### Assignments

Allowed UI Actions:

- Create assignment: admin or assigned mentor.
- Publish/close assignment: admin or assigned mentor.
- View assignments: all authenticated users, subject to repository visibility.

Frontend Rules:

- Students should only see backend-returned published assignments.
- Do not calculate “active” from deadline only; backend visibility is based on status and cohort relation (`src/assignments/assignments.repository.ts:17-30`).
- Show submission state from assignment `submissions` only where a dashboard endpoint includes it.

Frontend Validation:

| Field | Required | Min | Max | Pattern/Type | Source |
|---|---:|---:|---:|---|---|
| title | Yes | None | None | string, not empty | `src/common/dto.ts:155-159` |
| description | Yes | None | None | string, not empty | `src/common/dto.ts:161-164` |
| deadline | No | None | None | ISO date string | `src/common/dto.ts:166-169` |
| cohortId | Yes | None | None | UUID | `src/common/dto.ts:171-173` |
| status | No | None | None | `AssignmentStatus` | `src/common/dto.ts:175-181` |

### Submissions

Allowed UI Actions:

- Submit/resubmit assignment: student only.
- Review submission: mentor/admin with cohort manage access.
- List submissions: student sees own; mentor sees mentored cohorts. Admin listing is not globally supported by repository.

Frontend Rules:

- Resubmit updates existing submission and resets status to `SUBMITTED` (`src/submissions/submissions.repository.ts:23-29`).
- Do not create duplicate client-side rows after submission; replace by `(assignmentId, studentId)`.
- `feedback` is optional on review; notification behavior differs when feedback is present (`src/submissions/submissions.service.ts:93-102`).

Frontend Validation:

| Field | Required | Min | Max | Pattern/Type | Source |
|---|---:|---:|---:|---|---|
| assignmentId | Yes | None | None | UUID | `src/common/dto.ts:190-193` |
| githubUrl | No | None | None | URL | `src/common/dto.ts:195-198` |
| fileUrl | No | None | None | URL | `src/common/dto.ts:200-203` |
| note | No | None | None | string | `src/common/dto.ts:205-208` |
| status | Yes for review | None | None | `SubmissionStatus` | `src/common/dto.ts:211-217` |
| feedback | No | None | None | string | `src/common/dto.ts:219-222` |

### Community

Allowed UI Actions:

- Create post: any authenticated user.
- List posts: any authenticated user.
- React: any authenticated user.

Frontend Rules:

- Reactions are additive/idempotent per type; there is no unlike endpoint.
- Counts should be derived from returned `reactions` arrays unless a future aggregate endpoint is added.

Frontend Validation:

| Field | Required | Min | Max | Pattern/Type | Source |
|---|---:|---:|---:|---|---|
| content | Yes | None | None | string, not empty | `src/common/dto.ts:245-249` |
| imageUrl | No | None | None | URL | `src/common/dto.ts:251-254` |
| type | Yes | None | None | `ReactionType` | `src/common/dto.ts:257-260` |

### Comments

Allowed UI Actions:

- Create comment on post or submission: any authenticated user.
- List post comments: any authenticated user.

Frontend Rules:

- Send exactly one target: either `postId` or `submissionId`.
- There is no list endpoint for submission comments.
- There is no edit/delete endpoint.

Frontend Validation:

| Field | Required | Min | Max | Pattern/Type | Source |
|---|---:|---:|---:|---|---|
| postId | Conditional | None | None | UUID | `src/common/dto.ts:263-267`, `src/comments/comments.service.ts:23-26` |
| submissionId | Conditional | None | None | UUID | `src/common/dto.ts:269-272`, `src/comments/comments.service.ts:23-26` |
| content | Yes | None | None | string, not empty | `src/common/dto.ts:274-277` |

### Files

Allowed UI Actions:

- Create file metadata after a frontend/direct upload process.
- List current user's uploaded file metadata.

Frontend Rules:

- This backend does not accept file bytes. The frontend needs an external upload URL/workflow before calling `POST /files`.
- `ownerId` is optional and not FK-enforced.

Frontend Validation:

| Field | Required | Min | Max | Pattern/Type | Source |
|---|---:|---:|---:|---|---|
| filename | Yes | None | None | string, not empty | `src/common/dto.ts:280-284` |
| mimeType | Yes | None | None | string, not empty | `src/common/dto.ts:286-289` |
| size | Yes | 1 | None | integer | `src/common/dto.ts:291-294` |
| url | Yes | None | None | URL | `src/common/dto.ts:296-298` |
| ownerType | Yes | None | None | `FileOwnerType` | `src/common/dto.ts:300-302` |
| ownerId | No | None | None | UUID | `src/common/dto.ts:304-307` |

### Notifications And Push

Allowed UI Actions:

- List own notifications.
- Mark own notification read.
- Register/deactivate push token.
- Admin create direct notification.

Frontend Rules:

- `PATCH /notifications/:id/read` returns `{ count }`, not a notification object.
- No API exists for notification preferences.
- Queued notification schedules are backend-internal and currently not delivered by a worker.

Frontend Validation:

| Field | Required | Min | Max | Pattern/Type | Source |
|---|---:|---:|---:|---|---|
| userId | Yes | None | None | UUID | `src/common/dto.ts:225-228` |
| title | Yes | None | None | string, not empty | `src/common/dto.ts:230-233` |
| message | Yes | None | None | string, not empty | `src/common/dto.ts:235-238` |
| type | Yes | None | None | `NotificationType` | `src/common/dto.ts:240-242` |
| token | Yes | None | None | string, not empty | `src/push-tokens/dto/register-push-token.dto.ts:5-9` |
| platform | Yes | None | None | `PushPlatform` | `src/push-tokens/dto/register-push-token.dto.ts:11-13` |

### Activity

Allowed UI Actions:

- View own activity: all users.
- View all activity: admin.

Frontend Rules:

- Use cursor pagination from response `meta.cursor`.
- `limit` max is 100.

Frontend Validation:

| Field | Required | Min | Max | Pattern/Type | Source |
|---|---:|---:|---:|---|---|
| limit | No | 1 | 100 | integer | `src/activity/dto/activity-query.dto.ts:4-10` |
| cursor | No | None | None | string | `src/activity/dto/activity-query.dto.ts:12-14` |

### Streaks, Reputation, Achievements

Allowed UI Actions:

- View own streak.
- View own reputation.
- View public reputation summary for any user id.
- View/claim own achievements.

Frontend Rules:

- Do not calculate points, levels, streak expiry, or achievement unlocks locally.
- `POST /achievements/:id/claim` returns the full achievement list response.
- Claim has no explicit failure if achievement was not unlocked or already claimed.

### Challenges

Allowed UI Actions:

- Create: mentor/admin.
- List visible: all authenticated users.
- Join: student.
- Submit: student.

Frontend Rules:

- Respect `ACTIVE` and time window returned by backend; final eligibility is enforced server-side.
- Submit can create participant even without prior join; UI can still present join first as product flow, but should handle successful direct submit.
- Use `meta.cursor` for pagination.

Frontend Validation:

| Field | Required | Min | Max | Pattern/Type | Source |
|---|---:|---:|---:|---|---|
| title | Yes | None | None | string | `src/challenges/dto/create-challenge.dto.ts:12-15` |
| description | Yes | None | None | string | `src/challenges/dto/create-challenge.dto.ts:17-19` |
| cohortId | No | None | None | UUID | `src/challenges/dto/create-challenge.dto.ts:21-24` |
| startsAt | Yes | None | None | ISO date string | `src/challenges/dto/create-challenge.dto.ts:26-28` |
| endsAt | Yes | None | None | ISO date string | `src/challenges/dto/create-challenge.dto.ts:30-32` |
| rewardConfig | No | None | None | object | `src/challenges/dto/create-challenge.dto.ts:34-39` |
| status | No | None | None | `ChallengeStatus` | `src/challenges/dto/create-challenge.dto.ts:41-47` |
| limit | No | 1 | 100 | integer | `src/challenges/challenges.controller.ts:23-29` |
| cursor | No | None | None | string | `src/challenges/challenges.controller.ts:31-33` |
| submissionUrl | Yes | None | None | URL | `src/challenges/dto/submit-challenge.dto.ts:4-7` |
| note | No | None | None | string | `src/challenges/dto/submit-challenge.dto.ts:9-12` |

### Today Mission

Allowed UI Actions:

- View: student only.
- Execute returned `primaryAction.href`/`type`.

Frontend Rules:

- Render `data.primaryAction`.
- Do not reorder backend priorities.
- Known action types in code: `READ_FEEDBACK`, `SUBMIT_ASSIGNMENT`, `SUBMIT_CHALLENGE`, `READ_ANNOUNCEMENT`, `JOIN_CHALLENGE`, `POST_COMMUNITY_UPDATE` (`src/engagement/next-best-action.service.ts:28-131`).

### Dashboard

Allowed UI Actions:

- View own role dashboard.

Frontend Rules:

- Switch on `response.data.role`.
- Student dashboard has mission/streak/reputation/assignments/feedback/challenges/community/achievements/activity/momentum/featured builders.
- Mentor dashboard has submissions, momentum, at-risk students, recognition candidates.
- Admin dashboard has aggregate counts and completion rate.
- Sources: `src/dashboard/student-dashboard.service.ts:86-106`, `src/dashboard/mentor-action-center.service.ts:50-72`, `src/dashboard/admin-engagement-dashboard.service.ts:34-48`.

### Featured Builders

Allowed UI Actions:

- View current featured builders, optionally by cohortId.

Frontend Rules:

- GET can create a weekly selection as a side effect (`src/featured-builders/featured-builder.service.ts:14-30`).
- Do not compute featured builder rank in UI.

## Empty States

- Cohorts/materials/assignments/submissions/community/posts/comments/files/notifications/activity/challenges: show empty list when API returns `[]`.
- Streak: show zero state from `currentCount: 0`, `bestCount: 0`.
- Reputation: show `Explorer` and score 0 when no score exists.
- Achievements: show all active achievements with `unlockedAt: null`.
- Today Mission: backend always returns a fallback community update mission if no higher-priority action exists.

## Error States

- `401`: missing/invalid/expired token. Clear auth state and prompt login.
- `403`: hide action or show no-permission state.
- `404`: resource not found or inaccessible target.
- `400`: business rule violation or validation.
- `409`: duplicate email registration.
