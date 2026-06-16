# Authorization Matrix

Authentication implementation:

- JWT bearer authentication is implemented by `JwtAuthGuard` (`src/common/guards/jwt-auth.guard.ts:15-49`).
- The guard verifies `JWT_SECRET` with fallback `dev-only-change-me` (`src/common/guards/jwt-auth.guard.ts:29-32`).
- Request user is `{ id, email, role }` from JWT payload (`src/common/guards/jwt-auth.guard.ts:34-38`).
- Roles are enforced with `@Roles()` metadata and `RolesGuard` (`src/common/decorators/roles.decorator.ts:5`, `src/common/guards/roles.guard.ts:11-24`).
- If no roles are configured for a route, any authenticated user passes `RolesGuard` (`src/common/guards/roles.guard.ts:18-20`).

## Authentication Flow

```text
Register/Login
  -> AuthService verifies credentials or creates user
  -> AuthService signs JWT { sub, email, role }
  -> Frontend stores accessToken
  -> Frontend sends Authorization: Bearer <token>
  -> JwtAuthGuard verifies token and attaches request.user
  -> RolesGuard checks @Roles metadata when present
  -> Controller calls service
```

Implemented:

- JWT access token (`src/auth/auth.service.ts:81-91`).
- Password hash with bcrypt (`src/auth/auth.service.ts:36`, `src/auth/auth.service.ts:58-64`).

Not implemented:

- Refresh tokens.
- Cookie sessions.
- Server-side session storage.
- OAuth.
- Password reset.
- Email verification.

## Role Matrix

Legend: `Y` = allowed by route/service; `Own` = only own resource; `Cohort` = scoped by cohort membership or assigned mentor; `N` = not allowed.

| Feature / Action | STUDENT | MENTOR | ADMIN | Source |
|---|---:|---:|---:|---|
| Register public account | Y, student only | N | N | `src/auth/auth.service.ts:24-29` |
| Login | Y | Y | Y | `src/auth/auth.controller.ts:17-19` |
| Read current user | Y | Y | Y | `src/auth/auth.controller.ts:22-25` |
| List users | N | N | Y | `src/users/users.controller.ts:16-17` |
| Read user by id | Own | Own | Y | `src/users/users.service.ts:21-31` |
| Update profile | Own, no role change | Own, no role change | Y, can change role | `src/users/users.service.ts:34-49` |
| Create cohort | N | N | Y | `src/cohorts/cohorts.controller.ts:20-23` |
| List cohorts | Y | Y | Y | `src/cohorts/cohorts.controller.ts:26-28` |
| View cohort detail | Cohort member | Assigned mentor | Y | `src/cohorts/cohort-access.service.ts:14-30` |
| Add student to cohort | N | Assigned mentor | Y | `src/cohorts/cohorts.controller.ts:36-43`, `src/cohorts/cohort-access.service.ts:32-43` |
| Create cohort announcement | N | Assigned mentor | Y | `src/announcements/announcements.service.ts:21-34` |
| Create global announcement | N | N | Y | `src/announcements/announcements.service.ts:26-30` |
| List announcements | Visible only | Visible only | Global + mentored/member only per code | `src/announcements/announcements.repository.ts:13-24` |
| Mark announcement read | Visible only | Visible only | Visible only | `src/announcements/announcements.service.ts:63-85` |
| Create material | N | Assigned mentor | Y | `src/materials/materials.service.ts:14-23` |
| List materials | Member cohorts | Mentored cohorts | Only if member/mentor by query | `src/materials/materials.repository.ts:13-22` |
| Create assignment | N | Assigned mentor | Y | `src/assignments/assignments.service.ts:17-26` |
| List assignments | Published member cohort assignments | Mentored/created assignments | Only if creator/mentor by query | `src/assignments/assignments.repository.ts:17-30` |
| Publish/close assignment | N | Assigned mentor | Y | `src/assignments/assignments.service.ts:49-78` |
| Submit assignment | Y | N | N | `src/submissions/submissions.controller.ts:28-31` |
| List submissions | Own | Mentored cohort submissions | Not generally included by query | `src/submissions/submissions.repository.ts:49-59` |
| Review submission | N | Assigned mentor | Y | `src/submissions/submissions.controller.ts:39-46`, `src/submissions/submissions.service.ts:67-77` |
| Create community post | Y | Y | Y | `src/community/community.controller.ts:17-22` |
| React to post | Y | Y | Y | `src/community/community.controller.ts:30-36` |
| Comment | Y | Y | Y | `src/comments/comments.controller.ts:13-15` |
| Upload file metadata | Y | Y | Y | `src/files/files.controller.ts:13-15` |
| Create direct notification | N | N | Y | `src/notifications/notifications.controller.ts:24-27` |
| List own notifications | Y | Y | Y | `src/notifications/notifications.controller.ts:30-32` |
| Register push token | Y | Y | Y | `src/push-tokens/push-tokens.controller.ts:20-22` |
| List own activity | Y | Y | Y | `src/activity/activity.controller.ts:16-18` |
| List all activity | N | N | Y | `src/activity/activity.controller.ts:21-24` |
| View own streak | Y | Y | Y | `src/streaks/streaks.controller.ts:12-14` |
| View reputation profile | Y | Y | Y | `src/reputation/reputation.controller.ts:13-20` |
| View/claim own achievements | Y | Y | Y | `src/achievements/achievements.controller.ts:13-20` |
| Create challenge | N | Y | Y | `src/challenges/challenges.controller.ts:41-44` |
| Join challenge | Y | N | N | `src/challenges/challenges.controller.ts:55-58` |
| Submit challenge | Y | N | N | `src/challenges/challenges.controller.ts:61-68` |
| View Today Mission | Y | N | N | `src/engagement/engagement.controller.ts:15-18` |
| View dashboard | Y | Y | Y | `src/dashboard/dashboard.service.ts:26-32` |
| View featured builders | Y | Y | Y | `src/featured-builders/featured-builders.controller.ts:12-14` |
| View admin overview | N | N | Y | `src/admin/admin.controller.ts:8-16` |

## Backend vs Frontend Authorization Responsibilities

Backend owns:

- JWT verification.
- Role checks.
- Cohort membership/mentor/admin access checks.
- Profile ownership rules.
- Assignment/submission/challenge eligibility.

Frontend owns:

- Hiding unavailable UI actions based on current user role and returned resource fields.
- Handling `401` by clearing token or redirecting to login.
- Handling `403` as no permission.

Frontend must not:

- Treat hidden UI controls as security.
- Assume admin can list all resource types unless the endpoint query actually supports it.
- Infer cohort access locally without respecting backend errors.

## Security Risks

- `JWT_SECRET` fallback exists in both signing and verifying (`src/auth/auth.service.ts:89`, `src/common/guards/jwt-auth.guard.ts:31`). Production must set a real secret.
- No refresh token rotation or revocation model is implemented.
- Comments on submission targets do not check the actor can view that submission (`src/comments/comments.service.ts:39-48`).
