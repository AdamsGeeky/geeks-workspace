'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Mail, Star, Calendar, Award, Edit2, MessageSquare, FileText, Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { RoleBadge } from '@/components/shared/RoleBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAuthStore } from '@/store/authStore'
import api, { unwrapOne } from '@/lib/api'
import type { SafeUser, ReputationData } from '@/types'

function StatCard({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: number | string; accent?: string }) {
  return (
    <Card>
      <CardContent className="py-4 text-center">
        <div className={`flex items-center justify-center gap-1.5 mb-1 ${accent ?? 'text-foreground'}`}>
          <Icon className="size-4" />
          <span className="text-2xl font-bold text-foreground">{value}</span>
        </div>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}

export default function ProfileDetailPage() {
  const params = useParams<{ id: string }>()
  const { user: currentUser } = useAuthStore()
  const userId = params?.id
  const isOwnProfile = userId === currentUser?.id

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await api.get(`/users/${userId}`)
      return unwrapOne<SafeUser>(res.data)
    },
    enabled: !!userId,
  })

  const { data: reputation } = useQuery({
    queryKey: ['reputation', 'user', userId],
    queryFn: async () => {
      const res = await api.get(`/reputation/users/${userId}`)
      return unwrapOne<ReputationData>(res.data)
    },
    enabled: !!userId,
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Card>
          <CardContent className="py-6 flex flex-col sm:flex-row gap-6">
            <Skeleton className="size-20 rounded-full" />
            <div className="flex-1 flex flex-col gap-3">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return <EmptyState icon={Mail} title="User not found" description="This profile may have been removed." action={{ label: 'Back to Community', href: '/community' }} />
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <UserAvatar name={profile.fullName} avatarUrl={profile.avatarUrl} size="xl" />
            <div className="flex-1 min-w-0 flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{profile.fullName}</h1>
                <RoleBadge role={profile.role} />
              </div>
              {profile.bio && <p className="text-sm text-foreground leading-relaxed max-w-2xl">{profile.bio}</p>}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                  <Mail className="size-3.5" /> {profile.email}
                </a>
              </div>
            </div>
            {isOwnProfile && (
              <Button asChild variant="outline" size="sm" className="gap-2 self-start">
                <Link href="/profile"><Edit2 className="size-3.5" /> Edit Profile</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Star} label="Reputation" value={reputation?.score ?? 0} accent="text-amber-500" />
        <StatCard icon={Award} label="Level" value={reputation?.level ?? '—'} accent="text-primary" />
        <StatCard icon={FileText} label="Submission pts" value={reputation?.submissionPoints ?? 0} />
        <StatCard icon={MessageSquare} label="Community pts" value={reputation?.communityPoints ?? 0} />
      </div>

      {reputation && reputation.mentorPoints > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Mentor Contributions</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-2">
            <Flame className="size-4 text-orange-500" />
            <span className="text-sm text-muted-foreground">{reputation.mentorPoints} mentor points earned</span>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
