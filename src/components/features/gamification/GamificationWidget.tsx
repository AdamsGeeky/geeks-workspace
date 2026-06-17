'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Flame, Award, Lock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api, { unwrapList, unwrapOne } from '@/lib/api'
import { handleApiError } from '@/lib/handleApiError'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import type { StreakData, ReputationData, AchievementProgress } from '@/types'

export function GamificationWidget() {
  const queryClient = useQueryClient()

  const { data: streak } = useQuery({
    queryKey: ['streaks', 'me'],
    queryFn: async () => unwrapOne<StreakData>((await api.get('/streaks/me')).data),
    staleTime: 30_000,
  })

  const { data: reputation } = useQuery({
    queryKey: ['reputation', 'me'],
    queryFn: async () => unwrapOne<ReputationData>((await api.get('/reputation/me')).data),
    staleTime: 30_000,
  })

  const { data: achievements, isLoading } = useQuery({
    queryKey: ['achievements', 'me'],
    queryFn: async () => unwrapList<AchievementProgress>((await api.get('/achievements/me')).data),
    staleTime: 30_000,
  })

  const claim = useMutation({
    mutationFn: (id: string) => api.post(`/achievements/${id}/claim`),
    onSuccess: () => {
      toast.success('Achievement claimed!')
      queryClient.invalidateQueries({ queryKey: ['achievements', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['reputation', 'me'] })
    },
    onError: (e) => toast.error(handleApiError(e)),
  })

  const unlocked = (achievements ?? []).filter((a) => a.unlockedAt).slice(0, 3)
  const repTotal = reputation
    ? Math.max(reputation.submissionPoints + reputation.communityPoints + reputation.mentorPoints, 1)
    : 1

  return (
    <Card className="h-fit">
      <CardHeader>
        <h2 className="text-sm font-semibold">Your Progress</h2>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* Streak */}
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-full bg-primary/10">
            <Flame className="size-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold leading-none">
              {streak?.currentCount ?? 0} <span className="text-sm font-normal text-muted-foreground">day streak</span>
            </p>
            <p className="text-xs text-muted-foreground">Best: {streak?.bestCount ?? 0} days</p>
          </div>
          {streak?.expiresSoon && (
            <Badge variant="destructive" className="text-xs">Expires soon</Badge>
          )}
        </div>

        <Separator />

        {/* Reputation */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{reputation?.level ?? 'Newcomer'}</span>
            <Badge variant="secondary">{reputation?.score ?? 0} pts</Badge>
          </div>
          <div className="flex flex-col gap-1.5">
            <RepBar label="Submissions" value={reputation?.submissionPoints ?? 0} total={repTotal} />
            <RepBar label="Community" value={reputation?.communityPoints ?? 0} total={repTotal} />
            <RepBar label="Mentoring" value={reputation?.mentorPoints ?? 0} total={repTotal} />
          </div>
        </div>

        <Separator />

        {/* Recent achievements */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Recent Achievements</span>
            <Link href="/profile" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : unlocked.length === 0 ? (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="size-3.5" /> No achievements unlocked yet
            </p>
          ) : (
            unlocked.map((a) => (
              <div key={a.id} className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
                  <Award className="size-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{a.title}</p>
                  <p className="text-xs text-muted-foreground">+{a.xpReward} XP</p>
                </div>
                {!a.claimedAt && (
                  <Button size="sm" variant="outline" disabled={claim.isPending} onClick={() => claim.mutate(a.id)}>
                    {claim.isPending && <Loader2 data-icon="inline-start" className="animate-spin" />}
                    Claim
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function RepBar({ label, value, total }: { label: string; value: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 shrink-0 text-xs text-muted-foreground">{label}</span>
      <Progress value={(value / total) * 100} className="h-1.5 flex-1" />
      <span className="w-8 shrink-0 text-right text-xs tabular-nums">{value}</span>
    </div>
  )
}
