# TypeScript Types

These types are generated manually from implemented DTOs, Prisma schema, and service return shapes. Where backend returns raw Prisma objects, these interfaces intentionally mirror persisted fields plus noted includes.

## Enums

```ts
export type UserRole = 'STUDENT' | 'MENTOR' | 'ADMIN';
export type AssignmentStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type SubmissionStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'COMPLETED'
  | 'NEEDS_REVISION'
  | 'REJECTED';
export type ReactionType = 'LIKE' | 'FIRE' | 'CLAP' | 'INSPIRE';
export type NotificationType =
  | 'ANNOUNCEMENT'
  | 'ASSIGNMENT'
  | 'SUBMISSION_FEEDBACK'
  | 'COMMUNITY'
  | 'SYSTEM';
export type FileOwnerType =
  | 'USER'
  | 'MATERIAL'
  | 'ASSIGNMENT'
  | 'SUBMISSION'
  | 'COMMUNITY_POST';
export type StreakType = 'BUILD';
export type ReputationCategory = 'SUBMISSION' | 'COMMUNITY' | 'MENTOR';
export type AchievementType =
  | 'SUBMISSION'
  | 'COMMUNITY'
  | 'STREAK'
  | 'MENTOR'
  | 'CHALLENGE'
  | 'RECOGNITION';
export type ChallengeStatus = 'DRAFT' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
export type ChallengeParticipantStatus =
  | 'JOINED'
  | 'SUBMITTED'
  | 'COMPLETED'
  | 'WITHDRAWN';
export type MomentumPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type PushPlatform = 'IOS' | 'ANDROID' | 'WEB';
```

Enum sources: `prisma/schema.prisma:16-131`.

## Common

```ts
export type ISODateString = string;
export type UUID = string;

export interface Envelope<T> {
  data: T;
  actions: unknown[];
}

export interface PaginatedEnvelope<T> {
  data: T[];
  meta: {
    cursor: string | null;
    hasMore: boolean;
  };
  actions: [];
}

export interface PrimaryAction {
  type: string;
  label: string;
  href: string;
}
```

## Entities

```ts
export interface SafeUser {
  id: UUID;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Cohort {
  id: UUID;
  name: string;
  description: string | null;
  mentorId: UUID | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  mentor?: SafeUser | null;
  members?: CohortMemberWithUser[];
}

export interface CohortMember {
  id: UUID;
  cohortId: UUID;
  userId: UUID;
  createdAt: ISODateString;
}

export interface CohortMemberWithUser extends CohortMember {
  user: SafeUser;
}

export interface Announcement {
  id: UUID;
  title: string;
  content: string;
  cohortId: UUID | null;
  isGlobal: boolean;
  createdBy: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  reads?: AnnouncementRead[];
}

export interface AnnouncementRead {
  id: UUID;
  announcementId: UUID;
  userId: UUID;
  readAt: ISODateString;
}

export interface Material {
  id: UUID;
  title: string;
  description: string | null;
  url: string | null;
  fileUrl: string | null;
  cohortId: UUID;
  createdBy: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Assignment {
  id: UUID;
  title: string;
  description: string;
  deadline: ISODateString | null;
  cohortId: UUID;
  createdBy: UUID;
  status: AssignmentStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  submissions?: Submission[];
}

export interface Submission {
  id: UUID;
  assignmentId: UUID;
  studentId: UUID;
  githubUrl: string | null;
  fileUrl: string | null;
  note: string | null;
  status: SubmissionStatus;
  feedback: string | null;
  reviewedBy: UUID | null;
  submittedAt: ISODateString;
  reviewedAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  assignment?: Assignment;
  student?: SafeUser;
}

export interface CommunityPost {
  id: UUID;
  authorId: UUID;
  content: string;
  imageUrl: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  author?: Pick<SafeUser, 'id' | 'fullName' | 'email' | 'role' | 'avatarUrl' | 'bio' | 'createdAt' | 'updatedAt'>;
  comments?: Comment[];
  reactions?: Reaction[];
}

export interface Comment {
  id: UUID;
  authorId: UUID;
  postId: UUID | null;
  submissionId: UUID | null;
  content: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  author?: Pick<SafeUser, 'id' | 'fullName' | 'email' | 'role' | 'avatarUrl' | 'bio' | 'createdAt' | 'updatedAt'>;
}

export interface Reaction {
  id: UUID;
  userId: UUID;
  postId: UUID;
  type: ReactionType;
  createdAt: ISODateString;
}

export interface Notification {
  id: UUID;
  userId: UUID;
  title: string;
  message: string;
  type: NotificationType;
  fingerprint: string | null;
  isRead: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface FileAsset {
  id: UUID;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  ownerType: FileOwnerType;
  ownerId: UUID | null;
  uploadedBy: UUID;
  createdAt: ISODateString;
}

export interface ActivityEvent {
  id: UUID;
  userId: UUID | null;
  cohortId: UUID | null;
  eventType: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  occurredAt: ISODateString;
  createdAt: ISODateString;
}

export interface Challenge {
  id: UUID;
  title: string;
  description: string;
  cohortId: UUID | null;
  startsAt: ISODateString;
  endsAt: ISODateString;
  rewardConfig: Record<string, unknown> | null;
  status: ChallengeStatus;
  createdBy: UUID | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  participants?: ChallengeParticipant[];
}

export interface ChallengeParticipant {
  id: UUID;
  challengeId: UUID;
  userId: UUID;
  status: ChallengeParticipantStatus;
  submissionUrl: string | null;
  note: string | null;
  submittedAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
```

Entity field sources: `prisma/schema.prisma:133-620`.

## Request DTOs

```ts
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  role?: UserRole;
}

export interface CreateCohortRequest {
  name: string;
  description?: string;
  mentorId?: UUID;
}

export interface AddStudentToCohortRequest {
  studentId: UUID;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  cohortId?: UUID;
  isGlobal?: boolean;
}

export interface CreateMaterialRequest {
  title: string;
  description?: string;
  url?: string;
  fileUrl?: string;
  cohortId: UUID;
}

export interface CreateAssignmentRequest {
  title: string;
  description: string;
  deadline?: ISODateString;
  cohortId: UUID;
  status?: AssignmentStatus;
}

export interface UpdateAssignmentStatusRequest {
  status: AssignmentStatus;
}

export interface CreateSubmissionRequest {
  assignmentId: UUID;
  githubUrl?: string;
  fileUrl?: string;
  note?: string;
}

export interface ReviewSubmissionRequest {
  status: SubmissionStatus;
  feedback?: string;
}

export interface CreateNotificationRequest {
  userId: UUID;
  title: string;
  message: string;
  type: NotificationType;
}

export interface CreateCommunityPostRequest {
  content: string;
  imageUrl?: string;
}

export interface ReactToPostRequest {
  type: ReactionType;
}

export interface CreateCommentRequest {
  postId?: UUID;
  submissionId?: UUID;
  content: string;
}

export interface CreateFileRequest {
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  ownerType: FileOwnerType;
  ownerId?: UUID;
}

export interface RegisterPushTokenRequest {
  token: string;
  platform: PushPlatform;
}

export interface CreateChallengeRequest {
  title: string;
  description: string;
  cohortId?: UUID;
  startsAt: ISODateString;
  endsAt: ISODateString;
  rewardConfig?: Record<string, unknown>;
  status?: ChallengeStatus;
}

export interface SubmitChallengeRequest {
  submissionUrl: string;
  note?: string;
}

export interface CursorQuery {
  limit?: number;
  cursor?: string;
}
```

DTO validation sources: `src/common/dto.ts:24-307`, `src/push-tokens/dto/register-push-token.dto.ts:5-13`, `src/challenges/dto/create-challenge.dto.ts:12-47`, `src/challenges/dto/submit-challenge.dto.ts:4-12`.

## Response Types

```ts
export interface AuthResponse {
  user: SafeUser;
  accessToken: string;
}

export interface StreakResponse {
  data: {
    type: StreakType;
    currentCount: number;
    bestCount: number;
    lastActivityAt: ISODateString | null;
    isActiveToday: boolean;
    expiresSoon: boolean;
  };
  actions: [];
}

export interface ReputationResponse {
  data: {
    score: number;
    level: string;
    submissionPoints: number;
    communityPoints: number;
    mentorPoints: number;
  };
  actions: [];
}

export interface AchievementProgress {
  id: UUID;
  key: string;
  title: string;
  description: string;
  icon: string | null;
  type: AchievementType;
  xpReward: number;
  unlockedAt: ISODateString | null;
  claimedAt: ISODateString | null;
}

export interface AchievementsResponse {
  data: AchievementProgress[];
  actions: [];
}

export interface TodayMission {
  title: string;
  message: string;
  primaryAction: PrimaryAction;
  streak: {
    currentCount: number;
    expiresSoon: boolean;
  };
  reputation: {
    score: number;
    level: string;
  };
  context: {
    cohortMomentum: string;
    unreadFeedbackCount: number;
  };
}

export interface TodayMissionResponse {
  data: TodayMission;
  actions: PrimaryAction[];
}

export interface StudentDashboardResponse {
  data: {
    role: 'STUDENT';
    todayMission: TodayMission;
    streak: StreakResponse['data'];
    reputation: ReputationResponse['data'];
    activeAssignments: Assignment[];
    unreadFeedbackCount: number;
    activeChallenges: Challenge[];
    recentCommunityActivity: Array<CommunityPost & {
      author: Pick<SafeUser, 'id' | 'fullName' | 'avatarUrl'>;
    }>;
    recentAchievements: unknown[];
    recentActivity: ActivityEvent[];
    unreadFeedback: Notification[];
    feedbackCount: number;
    latestFeedback: (Submission & {
      assignment: Pick<Assignment, 'id' | 'title'>;
      reviewer: Pick<SafeUser, 'id' | 'fullName' | 'avatarUrl'> | null;
    }) | null;
    cohortMomentum: {
      cohortId?: UUID;
      activeBuilders: number;
      submissionsToday: number;
      postsToday: number;
      commentsToday: number;
      reactionsToday: number;
      topStreak: number;
    };
    featuredBuilders: FeaturedBuilder[];
    primaryCta: PrimaryAction;
  };
  actions: PrimaryAction[];
}

export interface MentorDashboardResponse {
  data: {
    role: 'MENTOR';
    pendingSubmissions: Submission[];
    recentSubmissions: Submission[];
    cohortMomentum: Array<{
      cohortId: UUID;
      name: string;
      assignments: number;
      students: number;
    }>;
    studentsAtRisk: Array<{
      userId: UUID;
      fullName: string;
      avatarUrl: string | null;
      severity: number;
      reasons: string[];
      missedDeadlines: number;
      lastActivityAt: ISODateString | null;
    }>;
    recognitionCandidates: Array<{
      userId: UUID;
      fullName: string;
      avatarUrl: string | null;
      score: number;
      topStreak: number;
      reputationGrowth: number;
      recentAchievements: unknown[];
      challengeCompletions: number;
    }>;
    studentsToRecognize: MentorDashboardResponse['data']['recognitionCandidates'];
    primaryCta: PrimaryAction;
  };
  actions: PrimaryAction[];
}

export interface AdminDashboardResponse {
  data: {
    role: 'ADMIN';
    activeUsers: number;
    activityEvents: number;
    completionRate: number;
    cohortEngagement: { cohorts: number };
    notificationEngagement: { notifications: number };
    mentorResponseTime: null;
  };
  actions: [];
}

export type DashboardResponse =
  | StudentDashboardResponse
  | MentorDashboardResponse
  | AdminDashboardResponse;

export interface FeaturedBuilder {
  id: UUID;
  userId: UUID;
  cohortId: UUID | null;
  reason: string;
  selectedBy: UUID | null;
  featuredAt: ISODateString;
  createdAt: ISODateString;
  user?: Pick<SafeUser, 'id' | 'fullName' | 'avatarUrl' | 'bio'>;
  cohort?: Pick<Cohort, 'id' | 'name'> | null;
  selector?: Pick<SafeUser, 'id' | 'fullName'> | null;
}

export interface FeaturedBuildersResponse {
  data: FeaturedBuilder[];
  actions: [];
}

export interface AdminOverviewResponse {
  users: number;
  cohorts: number;
  assignments: number;
  submissions: number;
  announcements: number;
  materials: number;
  communityPosts: number;
}
```

Response shape sources:

- Auth: `src/auth/auth.service.ts:44-47`, `src/auth/auth.service.ts:66-69`.
- Streak: `src/streaks/streaks.service.ts:36-46`.
- Reputation: `src/reputation/reputation.service.ts:36-44`.
- Achievements: `src/achievements/achievements.service.ts:19-38`.
- Today Mission: `src/engagement/today-mission.service.ts:36-50`.
- Dashboards: `src/dashboard/student-dashboard.service.ts:86-106`, `src/dashboard/mentor-action-center.service.ts:50-72`, `src/dashboard/admin-engagement-dashboard.service.ts:34-48`.
- Featured builders: `src/featured-builders/featured-builder.service.ts:16-30`.
- Admin overview: `src/admin/admin.repository.ts:27-35`.
