'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, parseISO } from 'date-fns'
import { Megaphone, Globe, Check, Plus, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { handleApiError } from '@/lib/handleApiError'
import type { Announcement, Cohort, Envelope } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  isGlobal: z.boolean().optional(),
  cohortId: z.string().optional(),
})

type FormData = z.infer<typeof schema>

function AnnouncementSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function AnnouncementsPage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const canCreate = user?.role === 'MENTOR' || user?.role === 'ADMIN'

  const { data: announcements, isLoading, error } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const res = await api.get<Announcement[]>('/announcements')
      return Array.isArray(res.data) ? res.data : (res.data as any).data ?? []
    },
    staleTime: 30_000,
  })

  const { data: cohorts } = useQuery({
    queryKey: ['cohorts'],
    queryFn: async () => {
      const res = await api.get<Cohort[]>('/cohorts')
      return Array.isArray(res.data) ? res.data : (res.data as any).data ?? []
    },
    enabled: canCreate,
    staleTime: 5 * 60_000,
  })

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/announcements/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }),
    onError: (err) => toast.error(handleApiError(err)),
  })

  const createMutation = useMutation({
    mutationFn: (data: FormData) => api.post('/announcements', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements'] })
      toast.success('Announcement created.')
      setOpen(false)
      reset()
    },
    onError: (err) => setApiError(handleApiError(err)),
  })

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isGlobal: false },
  })

  const isGlobal = watch('isGlobal')

  const isRead = (announcement: Announcement) =>
    !!announcement.reads?.some((r) => r.userId === user?.id)

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
          <p className="text-sm text-muted-foreground">Stay up to date with your cohort and platform.</p>
        </div>
        {canCreate && (
          <Button onClick={() => { setOpen(true); setApiError(null) }} className="gap-2">
            <Plus className="size-4" />
            New Announcement
          </Button>
        )}
      </div>

      {isLoading && <AnnouncementSkeleton />}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>Failed to load announcements.</AlertDescription>
        </Alert>
      )}

      {announcements && announcements.length === 0 && (
        <EmptyState
          icon={Megaphone}
          title="No announcements yet"
          description="Check back later for updates from your mentors and admins."
        />
      )}

      <div className="flex flex-col gap-3">
        {(announcements ?? []).map((a) => {
          const read = isRead(a)
          const expanded = expandedIds.has(a.id)
          return (
            <Card key={a.id} className={read ? '' : 'border-primary/40'}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className={`text-base ${read ? '' : 'text-foreground'}`}>
                    {!read && <span className="inline-block size-2 rounded-full bg-primary mr-2 align-middle" />}
                    {a.title}
                  </CardTitle>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {a.isGlobal && (
                      <Badge variant="info" className="gap-1">
                        <Globe className="size-3" /> Global
                      </Badge>
                    )}
                    {read && <Check className="size-4 text-muted-foreground" />}
                  </div>
                </div>
                <CardDescription>
                  {format(parseISO(a.createdAt), 'MMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className={`text-sm text-foreground leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
                  {a.content}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => toggleExpand(a.id)}>
                    {expanded ? 'Show less' : 'Read more'}
                  </Button>
                  {!read && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={markRead.isPending}
                      onClick={() => markRead.mutate(a.id)}
                    >
                      {markRead.isPending ? <Loader2 className="size-4 animate-spin" /> : 'Mark as read'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Announcement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => { setApiError(null); createMutation.mutate(d) })} className="flex flex-col gap-4">
            {apiError && (
              <Alert variant="destructive"><AlertDescription>{apiError}</AlertDescription></Alert>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="a-title">Title</Label>
              <Input id="a-title" placeholder="Demo day is Friday" {...register('title')} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="a-content">Content</Label>
              <Textarea id="a-content" placeholder="Share the details..." rows={4} {...register('content')} />
              {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
            </div>
            {user?.role === 'ADMIN' && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isGlobal"
                  className="rounded"
                  onChange={(e) => setValue('isGlobal', e.target.checked)}
                />
                <Label htmlFor="isGlobal">Send globally (all users)</Label>
              </div>
            )}
            {!isGlobal && (
              <div className="flex flex-col gap-1.5">
                <Label>Cohort</Label>
                <Select onValueChange={(v) => setValue('cohortId', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cohort" />
                  </SelectTrigger>
                  <SelectContent>
                    {(cohorts ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? <><Loader2 className="size-4 animate-spin" />Creating...</> : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
