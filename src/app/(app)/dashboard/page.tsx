'use client'

import { useQuery } from '@tanstack/react-query'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { useRouter } from 'next/navigation'
import {
  Flame, Star, ClipboardList, MessageSquare, Trophy,
  Users, AlertCircle, TrendingUp, RefreshCw,
} from 'lucide-react'
import api from '@/lib/api'
import type { StudentDashboard, MentorDashboard, AdminDashboard } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'

type DashboardData = StudentDashboard | MentorDashboard | AdminDashboard

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-2/3" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function StudentDash({ data }: { data: StudentDashboard }) {
  const router = useRouter()

  const actionRoutes: Record<string, string> = {
    READ_FEEDBACK: '/assignments',
    SUBMIT_ASSIGNMENT: '/assignments',
    SUBMIT_CHALLENGE: '/challenges',
    READ_ANNOUNCEMENT: '/announcements',
    JOIN_CHALLENGE: '/challenges',
    POST_COMMUNITY_UPDATE: '/community',
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Today's Mission */}
      {data.todayMission && (
        <Card className="border-primary/30 bg-primary/5 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="size-4 text-primary" />
              {data.todayMission.title}
            </CardTitle>
            <CardDescription>{data.todayMission.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="sm"
              onClick={() => {
                const href = actionRoutes[data.todayMission.primaryAction.type] ?? data.todayMission.primaryAction.href
                router.push(href)
              }}
            >
              {data.todayMission.primaryAction.label}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Streak */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Flame className="size-4 text-orange-500" />
            Streak
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-3xl font-bold text-foreground">
            {data.streak.currentCount} <span className="text-base font-normal text-muted-foreground">days</span>
          </p>
          <p className="text-sm text-muted-foreground">Best: {data.streak.bestCount} days</p>
          {data.streak.expiresSoon && (
            <Badge variant="orange" className="w-fit">Streak expiring soon!</Badge>
          )}
          {data.streak.isActiveToday && (
            <Badge variant="success" className="w-fit">Active today</Badge>
          )}
        </CardContent>
      </Card>

      {/* Reputation */}
      {data.reputation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-primary" />
              Reputation
            </CardTitle>
            <CardDescription>{data.reputation.level}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-2xl font-bold">{data.reputation.score} pts</p>
            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              <span>Submissions: {data.reputation.submissionPoints}</span>
              <span>Community: {data.reputation.communityPoints}</span>
              <span>Mentor: {data.reputation.mentorPoints}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="size-4 text-primary" />
            Active Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.activeAssignments && data.activeAssignments.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {data.activeAssignments.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate flex-1">{a.title}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {a.deadline && (
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(a.deadline), 'MMM d')}
                      </span>
                    )}
                    <StatusBadge status={a.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No active assignments right now.</p>
          )}
        </CardContent>
      </Card>

      {/* Unread Feedback */}
      {data.unreadFeedbackCount !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="size-4 text-primary" />
              Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-2xl font-bold">{data.unreadFeedbackCount}</p>
            <p className="text-sm text-muted-foreground">unread feedback items</p>
            {data.latestFeedback && (
              <div className="text-xs text-muted-foreground border rounded-md p-2">
                <p className="font-medium text-foreground">{data.latestFeedback.assignmentTitle}</p>
                <p>by {data.latestFeedback.reviewerName}</p>
                <Button variant="link" className="p-0 h-auto text-xs text-primary" onClick={() => location.href = '/assignments'}>
                  View
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active Challenges */}
      {data.activeChallenges && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="size-4 text-primary" />
              Active Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.activeChallenges.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {data.activeChallenges.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate flex-1">{c.title}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      Ends {formatDistanceToNow(parseISO(c.endsAt), { addSuffix: true })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No active challenges.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cohort Momentum */}
      {data.cohortMomentum && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4 text-primary" />
              Cohort Momentum
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Active builders</span>
              <span className="font-semibold">{data.cohortMomentum.activeBuilders}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Submissions today</span>
              <span className="font-semibold">{data.cohortMomentum.submissionsToday}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Posts today</span>
              <span className="font-semibold">{data.cohortMomentum.postsToday}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Featured Builders */}
      {data.featuredBuilders && data.featuredBuilders.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Featured Builders</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {data.featuredBuilders.map((b) => (
                <li key={b.id} className="flex items-center gap-3">
                  <UserAvatar name={b.fullName} avatarUrl={b.avatarUrl} className="size-8" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{b.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{b.reason}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function MentorDash({ data }: { data: MentorDashboard }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Pending Submissions */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Pending Submissions</CardTitle>
          <CardDescription>{data.pendingSubmissions?.length ?? 0} awaiting review</CardDescription>
        </CardHeader>
        <CardContent>
          {data.pendingSubmissions && data.pendingSubmissions.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {data.pendingSubmissions.map((s) => (
                <li key={s.id} className="flex items-center justify-between border rounded-md px-3 py-2 text-sm gap-3">
                  <span className="font-medium truncate">{s.studentName}</span>
                  <span className="text-muted-foreground truncate flex-1">{s.assignmentTitle}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {format(parseISO(s.submittedAt), 'MMM d')}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => location.href = '/assignments'}>
                    Review
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No pending submissions.</p>
          )}
        </CardContent>
      </Card>

      {/* Students at Risk */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Students at Risk</CardTitle>
        </CardHeader>
        <CardContent>
          {data.studentsAtRisk && data.studentsAtRisk.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {data.studentsAtRisk.map((s) => (
                <li key={s.id} className="text-sm border rounded-md p-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{s.name}</span>
                    <Badge variant="orange">{s.severity}</Badge>
                  </div>
                  <ul className="mt-1 text-xs text-muted-foreground list-disc list-inside">
                    {s.reasons.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">All students are on track.</p>
          )}
        </CardContent>
      </Card>

      {/* Recognition Candidates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recognition Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recognitionCandidates && data.recognitionCandidates.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {data.recognitionCandidates.map((c) => (
                <li key={c.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{c.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{c.score} pts</span>
                    <Badge variant="success">+{c.reputationGrowth}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No candidates yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Cohort Momentum */}
      {data.cohortMomentum && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Cohort Momentum</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-muted-foreground font-medium">Cohort</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Assignments</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Students</th>
                  </tr>
                </thead>
                <tbody>
                  {data.cohortMomentum.map((c, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2">{c.cohortName}</td>
                      <td className="py-2 text-right">{c.assignments}</td>
                      <td className="py-2 text-right">{c.students}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function AdminDash({ data }: { data: AdminDashboard }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Users', value: data.activeUsers },
          { label: 'Activity Events', value: data.activityEvents },
          { label: 'Completion Rate', value: `${Math.round((data.completionRate ?? 0) * 100)}%` },
          { label: 'Cohorts', value: data.cohortEngagement?.cohorts },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{stat.value ?? '—'}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div>
        <Button onClick={() => location.href = '/admin'} variant="outline">
          View Full Admin Panel
        </Button>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', 'me'],
    queryFn: async () => {
      const res = await api.get<{ data: DashboardData }>('/dashboard/me')
      return res.data.data ?? res.data
    },
    staleTime: 15_000,
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back to your workspace.</p>
      </div>

      {isLoading && <DashboardSkeleton />}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription className="flex items-center justify-between">
            Failed to load dashboard.
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="size-4" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {data && (
        <>
          {data.role === 'STUDENT' && <StudentDash data={data as StudentDashboard} />}
          {data.role === 'MENTOR' && <MentorDash data={data as MentorDashboard} />}
          {data.role === 'ADMIN' && <AdminDash data={data as AdminDashboard} />}
        </>
      )}
    </div>
  )
}
