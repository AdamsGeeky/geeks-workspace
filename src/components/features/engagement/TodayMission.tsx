'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Sparkles, ArrowRight, Flame } from 'lucide-react'
import api, { unwrapOne } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { TodayMissionData } from '@/types'

const ACTION_ROUTES: Record<string, string> = {
  READ_FEEDBACK: '/assignments',
  SUBMIT_ASSIGNMENT: '/assignments',
  SUBMIT_CHALLENGE: '/challenges',
  READ_ANNOUNCEMENT: '/announcements',
  JOIN_CHALLENGE: '/challenges',
  POST_COMMUNITY_UPDATE: '/community',
}

export function TodayMission() {
  const router = useRouter()

  const { data, isLoading } = useQuery({
    queryKey: ['engagement', 'today'],
    queryFn: async () => unwrapOne<TodayMissionData>((await api.get('/engagement/today')).data),
    staleTime: 15_000,
  })

  if (isLoading) {
    return (
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex flex-col gap-3 py-5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-9 w-36" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const route = ACTION_ROUTES[data.primaryAction?.type] ?? data.primaryAction?.href ?? '/dashboard'

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="flex flex-col gap-3 py-5">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">{data.title}</h2>
          {data.streak?.currentCount > 0 && (
            <span className="ml-auto flex items-center gap-1 text-xs font-medium text-primary">
              <Flame className="size-3.5" />
              {data.streak.currentCount}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground text-pretty">{data.message}</p>
        <Button className="w-fit" onClick={() => router.push(route)}>
          {data.primaryAction?.label ?? 'Get started'}
          <ArrowRight data-icon="inline-end" />
        </Button>
      </CardContent>
    </Card>
  )
}
