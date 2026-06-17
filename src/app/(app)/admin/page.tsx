'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Users, BookOpen, Megaphone, Trophy, FileText,
  ShieldCheck, ChevronRight, MessageSquare, AlertCircle, FolderOpen,
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuthStore } from '@/store/authStore'
import api, { unwrapOne } from '@/lib/api'
import type { AdminOverviewResponse } from '@/types'

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold leading-none">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const QUICK_ACTIONS = [
  { label: 'Create Announcement', icon: Megaphone, href: '/announcements' },
  { label: 'New Assignment', icon: BookOpen, href: '/assignments' },
  { label: 'Add Challenge', icon: Trophy, href: '/challenges' },
  { label: 'Manage Cohorts', icon: FolderOpen, href: '/cohorts' },
]

export default function AdminPage() {
  const { user } = useAuthStore()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: async () => {
      const res = await api.get('/admin/overview')
      return unwrapOne<AdminOverviewResponse>(res.data)
    },
    enabled: user?.role === 'ADMIN',
  })

  if (user && user.role !== 'ADMIN') {
    return (
      <div className="max-w-screen-lg">
        <Alert>
          <AlertCircle className="size-4" />
          <AlertDescription>You do not have permission to access this page. Admin access required.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-5 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground text-sm">Platform overview and management tools.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Card key={i}><CardContent className="py-4"><Skeleton className="h-14 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Users" value={stats?.users ?? 0} />
          <StatCard icon={FolderOpen} label="Cohorts" value={stats?.cohorts ?? 0} />
          <StatCard icon={BookOpen} label="Assignments" value={stats?.assignments ?? 0} />
          <StatCard icon={FileText} label="Submissions" value={stats?.submissions ?? 0} />
          <StatCard icon={Megaphone} label="Announcements" value={stats?.announcements ?? 0} />
          <StatCard icon={FolderOpen} label="Materials" value={stats?.materials ?? 0} />
          <StatCard icon={MessageSquare} label="Community Posts" value={stats?.communityPosts ?? 0} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            {QUICK_ACTIONS.map(({ label, icon: Icon, href }) => (
              <Button key={label} asChild variant="outline" className="w-full justify-start gap-2">
                <Link href={href}>
                  <Icon className="size-4 text-muted-foreground" />
                  {label}
                  <ChevronRight className="size-4 ml-auto text-muted-foreground" />
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Manage</CardTitle></CardHeader>
          <CardContent className="flex flex-col">
            {[
              { label: 'Cohort Management', href: '/cohorts', icon: FolderOpen },
              { label: 'Assignments & Reviews', href: '/assignments', icon: BookOpen },
              { label: 'Community Feed', href: '/community', icon: MessageSquare },
              { label: 'Materials Library', href: '/materials', icon: FileText },
            ].map(({ label, href, icon: Icon }) => (
              <Link key={label} href={href} className="flex items-center gap-2 py-2.5 text-sm hover:text-primary transition-colors border-b border-border last:border-0">
                <Icon className="size-4 text-muted-foreground shrink-0" />
                <span>{label}</span>
                <ChevronRight className="size-4 ml-auto text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
