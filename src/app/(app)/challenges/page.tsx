'use client'

import { useState, useMemo } from 'react'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trophy, Flame, Star, Loader2, Calendar, Users } from 'lucide-react'
import { toast } from 'sonner'
import { format, formatDistanceToNow, isFuture, isWithinInterval, parseISO } from 'date-fns'
import api, { unwrapList, unwrapOne } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { handleApiError } from '@/lib/handleApiError'
import type { Challenge, PaginatedEnvelope, StreakData, ReputationData } from '@/types'
import { CreateChallengeDialog } from '@/components/features/challenges/CreateChallengeDialog'
import { SubmitChallengeDialog } from '@/components/features/challenges/SubmitChallengeDialog'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'

function getXpReward(challenge: Challenge): number {
  const config = challenge.rewardConfig
  if (config && typeof config === 'object' && typeof (config as Record<string, unknown>).xp === 'number') {
    return (config as Record<string, number>).xp
  }
  return 0
}

const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  ENDED: 'bg-muted text-muted-foreground',
  DRAFT: 'bg-amber-100 text-amber-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

function isChallengeLive(challenge: Challenge): boolean {
  const now = new Date()
  return isWithinInterval(now, {
    start: parseISO(challenge.startsAt),
    end: parseISO(challenge.endsAt),
  })
}

export default function ChallengesPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('all')
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)

  const { data: streak } = useQuery({
    queryKey: ['streak', 'me'],
    queryFn: async () => {
      const res = await api.get('/streak/me')
      return unwrapOne<StreakData>(res.data)
    },
    enabled: !!user,
  })

  const { data: reputation } = useQuery({
    queryKey: ['reputation', 'me'],
    queryFn: async () => {
      const res = await api.get('/reputation/me')
      return unwrapOne<ReputationData>(res.data)
    },
    enabled: !!user,
  })

  const {
    data: challengesData,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery<PaginatedEnvelope<Challenge>, Error, any, any, string | null>({
    queryKey: ['challenges', { limit: 20 }],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams()
      params.set('limit', '20')
      if (pageParam) params.set('cursor', pageParam)
      const res = await api.get<PaginatedEnvelope<Challenge>>(`/challenges?${params.toString()}`)
      return res.data
    },
    getNextPageParam: (lastPage) => lastPage.meta.hasMore ? lastPage.meta.cursor : undefined,
    initialPageParam: null,
  })

  const allChallenges = useMemo(() => {
    return (challengesData?.pages ?? []).flatMap((page: PaginatedEnvelope<Challenge>) => page.data) ?? []
  }, [challengesData])

  const joinMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      await api.post(`/challenges/${challengeId}/join`)
    },
    onSuccess: () => {
      toast.success('Joined challenge!')
      queryClient.invalidateQueries({ queryKey: ['challenges'] })
    },
    onError: (err) => {
      toast.error(handleApiError(err))
    },
  })

  const filtered = useMemo(() => {
    return allChallenges.filter((c: Challenge) => {
      if (filter === 'all') return true
      if (filter === 'active') return c.status === 'ACTIVE'
      if (filter === 'ended') return c.status === 'ENDED'
      return true
    })
  }, [allChallenges, filter])

  const canCreateChallenge = user?.role === 'MENTOR' || user?.role === 'ADMIN'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Challenges</h1>
          <p className="text-muted-foreground text-sm">Build streaks, earn XP, and climb the ranks.</p>
        </div>
        {canCreateChallenge && <CreateChallengeDialog />}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="flex items-center gap-3 py-5">
            <Flame className="size-8 shrink-0" />
            <div>
              <p className="text-2xl font-bold">{streak?.currentCount ?? 0}</p>
              <p className="text-xs opacity-90">Day streak{streak?.expiresSoon ? ' · expires soon' : ''}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <Star className="size-8 shrink-0 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{reputation?.score ?? 0}</p>
              <p className="text-xs text-muted-foreground">{reputation?.level ?? 'Reputation'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <Trophy className="size-8 shrink-0 text-primary" />
            <div>
              <p className="text-2xl font-bold">{streak?.bestCount ?? 0}</p>
              <p className="text-xs text-muted-foreground">Best streak</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="ended">Ended</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="py-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Trophy} title="No challenges available right now" description="Check back soon for new challenges." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((challenge: Challenge) => {
              const participantCount = challenge.participants?.length ?? 0
              const hasJoined = !!challenge.participants?.some((p: any) => p.userId === user?.id)
              const isLive = isChallengeLive(challenge)
              const xp = getXpReward(challenge)
              const canJoin = user?.role === 'STUDENT' && challenge.status === 'ACTIVE' && !hasJoined
              const canSubmit = user?.role === 'STUDENT' && hasJoined

              return (
                <Card key={challenge.id} className="flex flex-col">
                  <CardHeader className="flex-row items-start justify-between gap-2">
                    <div className="flex flex-col gap-1 flex-1">
                      <h2 className="font-semibold leading-tight">{challenge.title}</h2>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={statusStyles[challenge.status] ?? ''} variant="secondary">
                          {challenge.status.toLowerCase()}
                        </Badge>
                        {xp > 0 && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="size-3" /> {xp} XP
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-3">
                    <p className="text-sm text-muted-foreground line-clamp-3">{challenge.description}</p>
                    <div className="mt-auto space-y-3">
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {isFuture(parseISO(challenge.endsAt))
                            ? `Ends ${formatDistanceToNow(parseISO(challenge.endsAt), { addSuffix: true })}`
                            : `Ended ${format(parseISO(challenge.endsAt), 'MMM d, yyyy')}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="size-3" /> {participantCount} joined
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {canJoin && (
                          <Button
                            size="sm"
                            variant="default"
                            className="flex-1"
                            disabled={joinMutation.isPending}
                            onClick={() => joinMutation.mutate(challenge.id)}
                          >
                            {joinMutation.isPending && joinMutation.variables === challenge.id && (
                              <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                            )}
                            Join
                          </Button>
                        )}
                        {canSubmit && (
                          <Button
                            size="sm"
                            variant="default"
                            className="flex-1"
                            onClick={() => {
                              setSelectedChallenge(challenge)
                              setSubmitDialogOpen(true)
                            }}
                          >
                            Submit
                          </Button>
                        )}
                        {hasJoined && !canSubmit && (
                          <Button size="sm" variant="outline" disabled className="flex-1">
                            Joined
                          </Button>
                        )}
                        {!canJoin && !canSubmit && user?.role === 'STUDENT' && challenge.status === 'ENDED' && (
                          <Button size="sm" variant="outline" disabled className="flex-1">
                            Challenge ended
                          </Button>
                        )}
                        {(user?.role === 'MENTOR' || user?.role === 'ADMIN') && (
                          <Button size="sm" variant="outline" disabled className="flex-1">
                            View details
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {hasNextPage && (
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full"
            >
              {isFetchingNextPage && (
                <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
              )}
              Load more
            </Button>
          )}
        </>
      )}

      {selectedChallenge && (
        <SubmitChallengeDialog
          challenge={selectedChallenge}
          open={submitDialogOpen}
          onOpenChange={setSubmitDialogOpen}
        />
      )}
    </div>
  )
}

