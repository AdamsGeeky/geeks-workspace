# Query Keys And Caching

The backend does not prescribe frontend cache keys. The following TanStack Query keys are recommended from actual endpoint/resource boundaries. Invalidation rules are based on implemented mutations and side effects.

Default recommendation:

- `staleTime`: 30 seconds for frequently changing feeds/dashboards; 5 minutes for reference lists.
- `gcTime`: 5 minutes for most queries.
- Optimistic updates: use only where backend mutation is idempotent and response shape is predictable.

## Auth And Users

| Query | Key | staleTime | Invalidate When |
|---|---|---:|---|
| Current user | `['auth', 'me']` | 5 min | login, register, profile update, logout |
| Users list | `['users']` | 1 min | admin updates any user |
| User detail | `['users', id]` | 1 min | update user |

Mutations:

- `POST /auth/register`: set `['auth','me']` from response user if desired.
- `POST /auth/login`: set token and invalidate `['auth','me']`.
- `PATCH /users/:id`: invalidate `['auth','me']`, `['users']`, `['users', id]`.

Sources: `src/auth/auth.controller.ts:12-25`, `src/users/users.controller.ts:16-33`.

## Cohorts

| Query | Key | staleTime | Invalidate When |
|---|---|---:|---|
| Cohorts | `['cohorts']` | 5 min | create cohort, add student |
| Cohort detail | `['cohorts', id]` | 1 min | add student |

Mutations:

- `POST /cohorts`: invalidate `['cohorts']`.
- `POST /cohorts/:id/students`: invalidate `['cohorts']`, `['cohorts', id]`.

Sources: `src/cohorts/cohorts.controller.ts:20-43`.

## Announcements

| Query | Key | staleTime | Invalidate When |
|---|---|---:|---|
| Visible announcements | `['announcements']` | 30 sec | create announcement, mark read |

Optimistic update:

- Mark read can optimistically append current user's read marker only if client has current user id. Safer approach: invalidate because response is `AnnouncementRead`.

Sources: `src/announcements/announcements.controller.ts:24-37`.

## Materials

| Query | Key | staleTime | Invalidate When |
|---|---|---:|---|
| Visible materials | `['materials']` | 5 min | create material |
| Cohort materials client filter | `['materials', 'cohort', cohortId]` | 5 min | create material |

Sources: `src/materials/materials.controller.ts:16-24`.

## Assignments

| Query | Key | staleTime | Invalidate When |
|---|---|---:|---|
| Visible assignments | `['assignments']` | 30 sec | create assignment, update status, create submission |
| Assignment detail | `['assignments', id]` | 30 sec | update status, create submission |

Mutations:

- `POST /assignments`: invalidate `['assignments']`, dashboard, activity, notifications when status is `PUBLISHED`.
- `PATCH /assignments/:id/status`: invalidate `['assignments']`, `['assignments', id]`, `['activity']`, notifications.

Sources: `src/assignments/assignments.controller.ts:28-46`, event side effects in `src/assignments/assignments.service.ts:28-40`, `src/assignments/assignments.service.ts:64-76`.

## Submissions

| Query | Key | staleTime | Invalidate When |
|---|---|---:|---|
| Visible submissions | `['submissions']` | 30 sec | create/resubmit, review |
| Assignment submissions client filter | `['submissions', 'assignment', assignmentId]` | 30 sec | create/resubmit, review |
| Student submissions client filter | `['submissions', 'student', studentId]` | 30 sec | create/resubmit, review |

Optimistic update:

- Avoid optimistic create unless replacing by `(assignmentId, currentUser.id)` because backend upserts.

Invalidations:

- Create/resubmit: `['submissions']`, `['assignments']`, `['dashboard','me']`, `['streaks','me']`, `['reputation','me']`, `['achievements','me']`, `['activity','me']`.
- Review: `['submissions']`, `['notifications']`, `['dashboard','me']`, target student's reputation/achievements if visible.

Sources: `src/submissions/submissions.service.ts:21-105`.

## Community And Comments

| Query | Key | staleTime | Invalidate When |
|---|---|---:|---|
| Posts | `['community', 'posts']` | 30 sec | create post, react, create post comment |
| Post comments | `['comments', 'post', postId]` | 30 sec | create post comment |

Optimistic update:

- Reactions are idempotent upserts. Optimistic append is possible but must avoid duplicates by `(userId, postId, type)`.
- Comments can be optimistically appended if target is a post; for submission comments there is no list endpoint.

Sources: `src/community/community.controller.ts:17-36`, `src/comments/comments.controller.ts:13-20`.

## Files

| Query | Key | staleTime | Invalidate When |
|---|---|---:|---|
| My files | `['files', 'me']` | 5 min | create file metadata |

Sources: `src/files/files.controller.ts:13-20`.

## Notifications And Push Tokens

| Query | Key | staleTime | Invalidate When |
|---|---|---:|---|
| My notifications | `['notifications']` | 15 sec | mark read, event-producing mutations |

Optimistic update:

- Mark read can optimistically set `isRead=true`; backend returns `{ count }`.

Mutations:

- Register push token: no list endpoint to invalidate.
- Delete push token: no list endpoint to invalidate.

Sources: `src/notifications/notifications.controller.ts:24-37`, `src/push-tokens/push-tokens.controller.ts:20-27`.

## Activity

| Query | Key | staleTime | Invalidate When |
|---|---|---:|---|
| My activity | `['activity', 'me', { limit }]` | 30 sec | any event-producing mutation |
| All activity | `['activity', 'all', { limit }]` | 30 sec | any event-producing mutation |

Pagination:

- Use infinite query with `pageParam = meta.cursor`.
- `limit` must be 1-100.

Sources: `src/activity/activity.service.ts:23-50`.

## Streaks, Reputation, Achievements

| Query | Key | staleTime | Invalidate When |
|---|---|---:|---|
| My streak | `['streaks', 'me']` | 30 sec | submission create, community post, comment, challenge submit |
| My reputation | `['reputation', 'me']` | 30 sec | reputation event-producing mutations |
| User reputation | `['reputation', 'users', id]` | 1 min | known user activity |
| My achievements | `['achievements', 'me']` | 30 sec | event-producing mutations, claim achievement |

Sources: event consumers in `src/streaks/streaks.service.ts:7-23`, `src/reputation/reputation.service.ts:47-135`, `src/achievements/achievements.service.ts:46-107`.

## Challenges

| Query | Key | staleTime | Invalidate When |
|---|---|---:|---|
| Visible challenges | `['challenges', { limit }]` | 30 sec | create challenge, join, submit |
| Challenge detail client cache | `['challenges', id]` | 30 sec | join, submit |

Pagination:

- Use `meta.cursor`.

Optimistic update:

- Join is idempotent and can optimistically add current user participant with `JOINED`.
- Submit can upsert participant; invalidate rather than complex optimistic merge.

Sources: `src/challenges/challenges.controller.ts:47-68`, `src/challenges/challenges.service.ts:46-111`.

## Engagement And Dashboard

| Query | Key | staleTime | Invalidate When |
|---|---|---:|---|
| Today Mission | `['engagement', 'today']` | 15 sec | feedback read, assignment submit, announcement read, challenge join/submit, post |
| Dashboard | `['dashboard', 'me']` | 15 sec | any event-producing mutation |

Frontend Notes:

- Both endpoints emit activity events when read (`src/engagement/today-mission.service.ts:29-34`, `src/dashboard/dashboard.service.ts:18-24`).
- Avoid aggressive polling because reads generate activity and can affect derived metrics.

## Featured Builders

| Query | Key | staleTime | Invalidate When |
|---|---|---:|---|
| Featured builders | `['featured-builders']` | 5 min | weekly boundary, reputation/streak changes |
| Featured builders by cohort | `['featured-builders', { cohortId }]` | 5 min | weekly boundary, cohort activity |

Important:

- `GET /featured-builders` can create a weekly selection as a side effect; avoid unnecessary refetch loops.

Source: `src/featured-builders/featured-builder.service.ts:14-30`.
