export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://geekink-cloud-sp39l.ondigitalocean.app/api/v1'

export const QUERY_KEYS = {
  AUTH_ME: ['auth', 'me'],
  DASHBOARD_ME: ['dashboard', 'me'],
  ANNOUNCEMENTS: ['announcements'],
  ASSIGNMENTS: ['assignments'],
  SUBMISSIONS: ['submissions'],
  COMMUNITY_POSTS: ['community', 'posts'],
  NOTIFICATIONS: ['notifications'],
  MATERIALS: ['materials'],
  CHALLENGES: ['challenges', { limit: 20 }],
  COHORTS: ['cohorts'],
  USERS: ['users'],
  ACTIVITY_ME: ['activity', 'me'],
  ACTIVITY_ALL: ['activity', 'all'],
  STREAKS_ME: ['streaks', 'me'],
  REPUTATION_ME: ['reputation', 'me'],
  ACHIEVEMENTS_ME: ['achievements', 'me'],
  FEATURED_BUILDERS: ['featured-builders'],
  ENGAGEMENT_TODAY: ['engagement', 'today'],
  ADMIN_OVERVIEW: ['admin', 'overview'],
} as const
