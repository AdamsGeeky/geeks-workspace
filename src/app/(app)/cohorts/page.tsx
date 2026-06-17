'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, ChevronRight, Search, FolderOpen } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { UserAvatar } from '@/components/shared/UserAvatar'
import api, { unwrapList } from '@/lib/api'
import type { Cohort } from '@/types'

function CohortCard({ cohort }: { cohort: Cohort }) {
  const memberCount = cohort.members?.length ?? 0
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-base">{cohort.name}</CardTitle>
        {cohort.description && (
          <CardDescription className="line-clamp-2">{cohort.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="size-4" /> {memberCount} members
          </span>
          {cohort.mentor && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <UserAvatar name={cohort.mentor.fullName} avatarUrl={cohort.mentor.avatarUrl} size="sm" />
              {cohort.mentor.fullName}
            </span>
          )}
        </div>
        <Button asChild variant="outline" size="sm" className="mt-auto w-full gap-1">
          <Link href={`/cohorts/${cohort.id}`}>
            View Cohort <ChevronRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default function CohortsPage() {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['cohorts'],
    queryFn: async () => {
      const res = await api.get('/cohorts')
      return unwrapList<Cohort>(res.data)
    },
  })

  const filtered = useMemo(() => {
    const cohorts = data ?? []
    if (!search) return cohorts
    const q = search.toLowerCase()
    return cohorts.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q),
    )
  }, [data, search])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cohorts</h1>
        <p className="text-muted-foreground text-sm">Explore all learning cohorts and their members.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search cohorts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="gap-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No cohorts found" description="Try adjusting your search or check back later." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cohort) => (
            <CohortCard key={cohort.id} cohort={cohort} />
          ))}
        </div>
      )}
    </div>
  )
}
