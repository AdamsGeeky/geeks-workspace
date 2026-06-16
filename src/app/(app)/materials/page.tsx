'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, parseISO } from 'date-fns'
import { BookOpen, ExternalLink, Download, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { handleApiError } from '@/lib/handleApiError'
import type { Material, Cohort } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EmptyState } from '@/components/shared/EmptyState'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  cohortId: z.string().min(1, 'Cohort is required'),
  url: z.string().url().optional().or(z.literal('')),
  fileUrl: z.string().url().optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

export default function MaterialsPage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [filterCohort, setFilterCohort] = useState<string>('all')

  const canCreate = user?.role === 'MENTOR' || user?.role === 'ADMIN'

  const { data: materials, isLoading } = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const res = await api.get<Material[]>('/materials')
      return Array.isArray(res.data) ? res.data : (res.data as any).data ?? []
    },
    staleTime: 5 * 60_000,
  })

  const { data: cohorts } = useQuery({
    queryKey: ['cohorts'],
    queryFn: async () => {
      const res = await api.get<Cohort[]>('/cohorts')
      return Array.isArray(res.data) ? res.data : (res.data as any).data ?? []
    },
    staleTime: 5 * 60_000,
  })

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const createMutation = useMutation({
    mutationFn: (data: FormData) => api.post('/materials', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['materials'] })
      toast.success('Material added.')
      setOpen(false)
      reset()
    },
    onError: (err) => setApiError(handleApiError(err)),
  })

  const filtered = (materials ?? []).filter(
    (m) => filterCohort === 'all' || m.cohortId === filterCohort
  )

  const cohortName = (id: string) =>
    (cohorts ?? []).find((c) => c.id === id)?.name ?? id

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resources & Materials</h1>
          <p className="text-sm text-muted-foreground">Learning materials shared by your mentors.</p>
        </div>
        {canCreate && (
          <Button onClick={() => { setOpen(true); setApiError(null) }} className="gap-2">
            <Plus className="size-4" /> Add Material
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Label className="shrink-0">Filter by cohort:</Label>
        <Select value={filterCohort} onValueChange={setFilterCohort}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cohorts</SelectItem>
            {(cohorts ?? []).map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No materials yet"
          description="No materials have been added yet."
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m) => (
          <Card key={m.id}>
            <CardHeader>
              <CardTitle className="text-base">{m.title}</CardTitle>
              <CardDescription>
                <Badge variant="secondary">{cohortName(m.cohortId)}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {m.description && (
                <p className="text-sm text-muted-foreground">{m.description}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {m.url && (
                  <Button asChild variant="outline" size="sm">
                    <a href={m.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-4" /> Open Link
                    </a>
                  </Button>
                )}
                {m.fileUrl && (
                  <Button asChild variant="outline" size="sm">
                    <a href={m.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="size-4" /> Download File
                    </a>
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Added {format(parseISO(m.createdAt), 'MMM d, yyyy')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Material</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((d) => { setApiError(null); createMutation.mutate(d) })} className="flex flex-col gap-4">
            {apiError && <Alert variant="destructive"><AlertDescription>{apiError}</AlertDescription></Alert>}
            <div className="flex flex-col gap-1.5">
              <Label>Title</Label>
              <Input placeholder="React State Management Guide" {...register('title')} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Description (optional)</Label>
              <Textarea placeholder="Reading material for this week..." {...register('description')} />
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
            <div className="flex flex-col gap-1.5">
              <Label>Link URL (optional)</Label>
              <Input type="url" placeholder="https://example.com/material" {...register('url')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>File URL (optional)</Label>
              <Input type="url" placeholder="https://example.com/material.pdf" {...register('fileUrl')} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? <><Loader2 className="size-4 animate-spin" />Adding...</> : 'Add Material'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
