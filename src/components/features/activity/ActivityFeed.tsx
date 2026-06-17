'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Activity } from 'lucide-react'
import type { ActivityEvent } from '@/types'

interface ActivityResponse {
  data: ActivityEvent[]
  meta: { cursor: string | null; hasMore: boolean }
}

const EVENT_LABELS: Record<string, string> = {
  SUBMISSION_CREATED: 'Submitted an assignment',
  SUBMISSION_REVIEWED: 'Received feedback on a submission',
  ASSIGNMENT_CREATED: 'A new assignment was posted',
  ANNOUNCEMENT_CREATED: 'A new announcement was published',
  COMMENT_CREATED: 'Commented on a post',
  POST_CREATED: 'Shared a community update',
  REACTION_CREATED: 'Reacted to a post',
  CHALLENGE_JOINED: 'Joined a challenge',
  CHALLENGE_SUBMITTED: 'Submitted to a challenge',
  ACHIEVEMENT_UNLOCKED: 'Unlocked an achievement',
  MATERIAL_CREATED: 'A new material was shared',
  COHORT_STUDENT_ADDED: 'Joined a cohort',
}

function humanize(eventType: string): string {
  return EVENT_LABELS[eventType] ?? eventType.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())
}

interface ActivityFeedProps {
  mode: 'me' | 'all'
  limit?: number
}

export function ActivityFeed({ mode, limit = 10 }: ActivityFeedProps) {
  const endpoint = mode === 'me' ? '/activity/me' : '/activity'

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['activity', mode, { limit }],
    queryFn: async ({ pageParam }) => {
      const res = await api.get<ActivityResponse>(endpoint, {
        params: { limit, ...(pageParam ? { cursor: pageParam } : {}) },
      })
      return res.data
    },
    initialPageParam: '' as string,
    getNextPageParam: (lastPage) => (lastPage.meta?.hasMore ? lastPage.meta.cursor : undefined),
    staleTime: 30_000,
  })

  const events = data?.pages.flatMap((p) => p.data ?? []) ?? []

  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold">Activity</h2>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="size-3 rounded-full" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <EmptyState icon={Activity} title="No activity yet" description="Activity will appear here as you engage." />
        ) : (
          <>
            <ol className="relative flex flex-col gap-5 border-l border-border pl-5">
              {events.map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[1.4rem] top-1 size-2.5 rounded-full bg-primary ring-4 ring-background" />
                  <p className="text-sm leading-snug">{humanize(e.eventType)}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.entityType ? `${e.entityType.toLowerCase()} · ` : ''}
                    {formatDistanceToNow(new Date(e.occurredAt), { addSuffix: true })}
                  </p>
                </li>
              ))}
            </ol>
            {hasNextPage && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                disabled={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                {isFetchingNextPage && <Loader2 data-icon="inline-start" className="animate-spin" />}
                Load more
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
