'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, parseISO, isPast } from 'date-fns'
import { ClipboardList, Plus, Loader2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { handleApiError } from '@/lib/handleApiError'
import type { Assignment, Cohort } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  cohortId: z.string().min(1, 'Cohort is required'),
  deadline: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function AssignmentsPage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')

  const canManage = user?.role === 'MENTOR' || user?.role === 'ADMIN'

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const res = await api.get<Assignment[]>('/assignments')
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
    enabled: canManage,
    staleTime: 5 * 60_000,
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/assignments/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] })
      toast.success('Assignment status updated.')
    },
    onError: (err) => toast.error(handleApiError(err)),
  })

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const createMutation = useMutation({
    mutationFn: (data: FormData) => api.post('/assignments', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] })
      toast.success('Assignment created.')
      setOpen(false)
      reset()
    },
    onError: (err) => setApiError(handleApiError(err)),
  })

  const filtered = (assignments ?? []).filter(
    (a) => statusFilter === 'all' || a.status === statusFilter
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assignments</h1>
          <p className="text-sm text-muted-foreground">Track and manage your assignments.</p>
        </div>
        {canManage && (
          <Button onClick={() => { setOpen(true); setApiError(null) }} className="gap-2">
            <Plus className="size-4" /> Create Assignment
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="DRAFT">Draft</TabsTrigger>
          <TabsTrigger value="PUBLISHED">Published</TabsTrigger>
          <TabsTrigger value="CLOSED">Closed</TabsTrigger>
        </TabsList>

        {['all', 'DRAFT', 'PUBLISHED', 'CLOSED'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1, 2].map((i) => (
                  <Card key={i}>
                    <CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader>
                    <CardContent><Skeleton className="h-4 w-full" /></CardContent>
                  </Card>
                ))}
              </div>
            )}
            {!isLoading && filtered.length === 0 && (
              <EmptyState icon={ClipboardList} title="No assignments" description="No assignments found for this filter." />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((a) => (
                <Card key={a.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{a.title}</CardTitle>
                      <StatusBadge status={a.status} />
                    </div>
                    {a.deadline && (
                      <CardDescription className={isPast(parseISO(a.deadline)) ? 'text-destructive' : ''}>
                        Due: {format(parseISO(a.deadline), 'MMM d, yyyy')}
                        {isPast(parseISO(a.deadline)) && ' (Past deadline)'}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="flex items-center gap-2 flex-wrap">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/assignments/${a.id}`}>
                        <Eye className="size-4" /> View
                      </Link>
                    </Button>
                    {canManage && a.status === 'DRAFT' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus.mutate({ id: a.id, status: 'PUBLISHED' })}
                        disabled={updateStatus.isPending}
                      >
                        Publish
                      </Button>
                    )}
                    {canManage && a.status === 'PUBLISHED' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatus.mutate({ id: a.id, status: 'CLOSED' })}
                        disabled={updateStatus.isPending}
                      >
                        Close
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Assignment</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((d) => { setApiError(null); createMutation.mutate(d) })} className="flex flex-col gap-4">
            {apiError && <Alert variant="destructive"><AlertDescription>{apiError}</AlertDescription></Alert>}
            <div className="flex flex-col gap-1.5">
              <Label>Title</Label>
              <Input placeholder="Build a personal portfolio" {...register('title')} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Description</Label>
              <Textarea placeholder="Assignment instructions..." rows={4} {...register('description')} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Deadline (optional)</Label>
              <Input type="datetime-local" {...register('deadline')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Cohort</Label>
              <Select onValueChange={(v) => setValue('cohortId', v)}>
                <SelectTrigger><SelectValue placeholder="Select cohort" /></SelectTrigger>
                <SelectContent>
                  {(cohorts ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.cohortId && <p className="text-sm text-destructive">{errors.cohortId.message}</p>}
            </div>
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
