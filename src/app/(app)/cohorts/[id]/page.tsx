'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Users, BookOpen, ChevronLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { RoleBadge } from '@/components/shared/RoleBadge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import api, { unwrapOne, unwrapList } from '@/lib/api'
import type { Cohort, Assignment, CohortMemberWithUser } from '@/types'

export default function CohortDetailPage() {
  const params = useParams<{ id: string }>()
  const cohortId = params?.id

  const { data: cohort, isLoading } = useQuery({
    queryKey: ['cohort', cohortId],
    queryFn: async () => {
      const res = await api.get(`/cohorts/${cohortId}`)
      return unwrapOne<Cohort>(res.data)
    },
    enabled: !!cohortId,
  })

  const { data: assignments } = useQuery({
    queryKey: ['assignments', { cohortId }],
    queryFn: async () => {
      const res = await api.get('/assignments', { params: { cohortId } })
      return unwrapList<Assignment>(res.data)
    },
    enabled: !!cohortId,
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!cohort) {
    return <EmptyState icon={Users} title="Cohort not found" description="This cohort may have been removed." action={{ label: 'Back to Cohorts', href: '/cohorts' }} />
  }

  const members = cohort.members ?? []
  const mentors = members.filter((m) => m.user.role === 'MENTOR')
  const students = members.filter((m) => m.user.role === 'STUDENT')
  const cohortAssignments = assignments ?? []

  return (
    <div className="flex flex-col gap-6">
      <Button asChild variant="ghost" size="sm" className="gap-2 -ml-2 self-start">
        <Link href="/cohorts">
          <ChevronLeft className="size-4" /> Back to Cohorts
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{cohort.name}</CardTitle>
          {cohort.description && <CardDescription>{cohort.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="text-2xl font-bold">{students.length}</p>
              <p className="text-muted-foreground">Students</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{mentors.length}</p>
              <p className="text-muted-foreground">Mentors</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{cohortAssignments.length}</p>
              <p className="text-muted-foreground">Assignments</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members" className="gap-1.5"><Users className="size-4" /> Members</TabsTrigger>
          <TabsTrigger value="assignments" className="gap-1.5"><BookOpen className="size-4" /> Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-4 flex flex-col gap-6">
          {mentors.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Mentors</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {mentors.map((m) => <MemberCard key={m.id} member={m} />)}
              </div>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Students ({students.length})</h3>
            {students.length === 0 ? (
              <p className="text-sm text-muted-foreground">No students enrolled yet.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {students.map((m) => <MemberCard key={m.id} member={m} />)}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="mt-4 flex flex-col gap-3">
          {cohortAssignments.length === 0 ? (
            <EmptyState icon={BookOpen} title="No assignments" description="This cohort has no assignments yet." />
          ) : (
            cohortAssignments.map((a) => (
              <Link key={a.id} href={`/assignments/${a.id}`}>
                <Card className="hover:shadow-sm transition-shadow">
                  <CardContent className="py-4 flex items-center gap-3">
                    <BookOpen className="size-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{a.title}</p>
                      {a.deadline && (
                        <p className="text-xs text-muted-foreground">
                          Due {new Date(a.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={a.status} />
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MemberCard({ member }: { member: CohortMemberWithUser }) {
  return (
    <Link href={`/profile/${member.user.id}`}>
      <Card className="hover:shadow-sm transition-shadow">
        <CardContent className="py-4 flex items-center gap-3">
          <UserAvatar name={member.user.fullName} avatarUrl={member.user.avatarUrl} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{member.user.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
          </div>
          <RoleBadge role={member.user.role} />
        </CardContent>
      </Card>
    </Link>
  )
}
