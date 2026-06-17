export type UserRole = 'STUDENT' | 'MENTOR' | 'ADMIN'
export type AssignmentStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED'
export type SubmissionStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'COMPLETED' | 'NEEDS_REVISION' | 'REJECTED'
export type ReactionType = 'LIKE' | 'FIRE' | 'CLAP' | 'INSPIRE'
export type NotificationType = 'ANNOUNCEMENT' | 'ASSIGNMENT' | 'SUBMISSION_FEEDBACK' | 'COMMUNITY' | 'SYSTEM'
export type ChallengeStatus = 'DRAFT' | 'ACTIVE' | 'ENDED' | 'CANCELLED'
export type ChallengeParticipantStatus = 'JOINED' | 'SUBMITTED' | 'COMPLETED' | 'WITHDRAWN'
export type PushPlatform = 'IOS' | 'ANDROID' | 'WEB'
export type FileOwnerType = 'USER' | 'MATERIAL' | 'ASSIGNMENT' | 'SUBMISSION' | 'COMMUNITY_POST'
export type AchievementType = 'SUBMISSION' | 'COMMUNITY' | 'STREAK' | 'MENTOR' | 'CHALLENGE' | 'RECOGNITION'
export type ISODateString = string
export type UUID = string

export interface SafeUser { id: UUID; fullName: string; email: string; role: UserRole; avatarUrl: string | null; bio: string | null; createdAt: ISODateString; updatedAt: ISODateString }
export interface Cohort { id: UUID; name: string; description: string | null; mentorId: UUID | null; createdAt: ISODateString; updatedAt: ISODateString; mentor?: SafeUser | null; members?: CohortMemberWithUser[] }
export interface CohortMember { id: UUID; cohortId: UUID; userId: UUID; createdAt: ISODateString }
export interface CohortMemberWithUser extends CohortMember { user: SafeUser }
export interface Announcement { id: UUID; title: string; content: string; cohortId: UUID | null; isGlobal: boolean; createdBy: UUID; createdAt: ISODateString; updatedAt: ISODateString; reads?: AnnouncementRead[] }
export interface AnnouncementRead { id: UUID; announcementId: UUID; userId: UUID; readAt: ISODateString }
export interface Material { id: UUID; title: string; description: string | null; url: string | null; fileUrl: string | null; cohortId: UUID; createdBy: UUID; createdAt: ISODateString; updatedAt: ISODateString }
export interface Assignment { id: UUID; title: string; description: string; deadline: ISODateString | null; cohortId: UUID; createdBy: UUID; status: AssignmentStatus; createdAt: ISODateString; updatedAt: ISODateString; submissions?: Submission[] }
export interface Submission { id: UUID; assignmentId: UUID; studentId: UUID; githubUrl: string | null; fileUrl: string | null; note: string | null; status: SubmissionStatus; feedback: string | null; reviewedBy: UUID | null; submittedAt: ISODateString; reviewedAt: ISODateString | null; createdAt: ISODateString; updatedAt: ISODateString; assignment?: Assignment; student?: SafeUser }
export interface CommunityPost { id: UUID; authorId: UUID; content: string; imageUrl: string | null; createdAt: ISODateString; updatedAt: ISODateString; author?: Pick<SafeUser, 'id' | 'fullName' | 'email' | 'role' | 'avatarUrl' | 'bio' | 'createdAt' | 'updatedAt'>; comments?: Comment[]; reactions?: Reaction[] }
export interface Comment { id: UUID; authorId: UUID; postId: UUID | null; submissionId: UUID | null; content: string; createdAt: ISODateString; updatedAt: ISODateString; author?: Pick<SafeUser, 'id' | 'fullName' | 'email' | 'role' | 'avatarUrl' | 'bio' | 'createdAt' | 'updatedAt'> }
export interface Reaction { id: UUID; userId: UUID; postId: UUID; type: ReactionType; createdAt: ISODateString }
export interface Notification { id: UUID; userId: UUID; title: string; message: string; type: NotificationType; fingerprint: string | null; isRead: boolean; createdAt: ISODateString; updatedAt: ISODateString }
export interface Challenge { id: UUID; title: string; description: string; cohortId: UUID | null; startsAt: ISODateString; endsAt: ISODateString; rewardConfig: Record<string, unknown> | null; status: ChallengeStatus; createdBy: UUID | null; createdAt: ISODateString; updatedAt: ISODateString; participants?: ChallengeParticipant[] }
export interface ChallengeParticipant { id: UUID; challengeId: UUID; userId: UUID; status: ChallengeParticipantStatus; submissionUrl: string | null; note: string | null; submittedAt: ISODateString | null; createdAt: ISODateString; updatedAt: ISODateString }
export interface AuthResponse { user: SafeUser; accessToken: string }
export interface PaginatedEnvelope<T> { data: T[]; meta: { cursor: string | null; hasMore: boolean }; actions: [] }
export interface Envelope<T> { data: T; actions: unknown[] }

// Dashboard types
export interface StudentDashboard {
  role: 'STUDENT'
  todayMission: { title: string; message: string; primaryAction: { label: string; href: string; type: string } }
  streak: { currentCount: number; bestCount: number; isActiveToday: boolean; expiresSoon: boolean }
  reputation: { level: string; score: number; submissionPoints: number; communityPoints: number; mentorPoints: number }
  activeAssignments: Array<{ id: UUID; title: string; deadline: ISODateString | null; status: AssignmentStatus }>
  unreadFeedbackCount: number
  latestFeedback: { assignmentTitle: string; reviewerName: string } | null
  activeChallenges: Array<{ id: UUID; title: string; endsAt: ISODateString }>
  featuredBuilders: Array<{ id: UUID; fullName: string; avatarUrl: string | null; reason: string }>
  cohortMomentum: { activeBuilders: number; submissionsToday: number; postsToday: number }
}
export interface MentorDashboard {
  role: 'MENTOR'
  pendingSubmissions: Array<{ id: UUID; studentName: string; assignmentTitle: string; submittedAt: ISODateString }>
  studentsAtRisk: Array<{ id: UUID; name: string; severity: string; reasons: string[] }>
  recognitionCandidates: Array<{ id: UUID; name: string; score: number; reputationGrowth: number }>
  cohortMomentum: Array<{ cohortName: string; assignments: number; students: number }>
}
export interface AdminDashboard {
  role: 'ADMIN'
  activeUsers: number
  activityEvents: number
  completionRate: number
  cohortEngagement: { cohorts: number }
}

export interface StreakData { currentCount: number; bestCount: number; isActiveToday: boolean; expiresSoon: boolean }
export interface ReputationData { score: number; level: string; submissionPoints: number; communityPoints: number; mentorPoints: number }
export interface AchievementData { id: UUID; title: string; description: string; type: AchievementType; unlockedAt: ISODateString | null; claimedAt: ISODateString | null }

// Featured builders (matches GET /featured-builders shape)
export interface FeaturedBuilder {
  id: UUID
  userId: UUID
  cohortId: UUID | null
  reason: string
  selectedBy: UUID | null
  featuredAt: ISODateString
  createdAt: ISODateString
  user?: Pick<SafeUser, 'id' | 'fullName' | 'avatarUrl' | 'bio'>
  cohort?: Pick<Cohort, 'id' | 'name'> | null
}

// Achievement progress (matches GET /achievements/me items)
export interface AchievementProgress {
  id: UUID
  key: string
  title: string
  description: string
  icon: string | null
  type: AchievementType
  xpReward: number
  unlockedAt: ISODateString | null
  claimedAt: ISODateString | null
}

// Admin overview (matches GET /admin/overview)
export interface AdminOverviewResponse {
  users: number
  cohorts: number
  assignments: number
  submissions: number
  announcements: number
  materials: number
  communityPosts: number
}

// Activity event (matches GET /activity, /activity/me items)
export interface ActivityEvent {
  id: UUID
  userId: UUID | null
  cohortId: UUID | null
  eventType: string
  entityType: string | null
  entityId: string | null
  metadata: Record<string, unknown> | null
  occurredAt: ISODateString
  createdAt: ISODateString
}

// Today Mission (matches GET /engagement/today data shape)
export interface TodayMissionData {
  title: string
  message: string
  primaryAction: { type: string; label: string; href: string }
  streak: { currentCount: number; expiresSoon: boolean }
  reputation: { score: number; level: string }
  context: { cohortMomentum: string; unreadFeedbackCount: number }
}
