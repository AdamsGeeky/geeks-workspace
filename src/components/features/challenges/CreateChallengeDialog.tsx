'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import api, { unwrapList } from '@/lib/api'
import { handleApiError } from '@/lib/handleApiError'
import type { Challenge, Cohort } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const createChallengeSchema = z.object({
  title: z.string().min(1, 'Title is required').min(3, 'Title must be at least 3 characters'),
  description: z.string().min(1, 'Description is required').min(10, 'Description must be at least 10 characters'),
  cohortId: z.string().nullable().optional(),
  startsAt: z.string().min(1, 'Start date is required'),
  endsAt: z.string().min(1, 'End date is required'),
  status: z.enum(['DRAFT', 'ACTIVE']).default('ACTIVE'),
}).refine((data) => new Date(data.endsAt) > new Date(data.startsAt), {
  message: 'End date must be after start date',
  path: ['endsAt'],
})

type FormData = z.infer<typeof createChallengeSchema>

export function CreateChallengeDialog() {
  const [open, setOpen] = useState(false)
  const qc = useQueryClient()

  const { data: cohorts = [] } = useQuery({
    queryKey: ['cohorts'],
    queryFn: async () => {
      const res = await api.get('/cohorts')
      return unwrapList<Cohort>(res.data)
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue,
  } = useForm<FormData>({
    // @ts-expect-error - zod resolver type mismatch with optional status
    resolver: zodResolver(createChallengeSchema),
    mode: 'onChange',
    defaultValues: {
      status: 'ACTIVE',
    } as any,
  })

  const startsAt = watch('startsAt')
  const endsAt = watch('endsAt')
  const endDateError = !!(startsAt && endsAt && new Date(endsAt) <= new Date(startsAt))

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await api.post<{ data: Challenge }>('/challenges', {
        title: data.title,
        description: data.description,
        cohortId: data.cohortId || null,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        status: data.status,
      })
      return res.data.data
    },
    onSuccess: () => {
      toast.success('Challenge created successfully')
      qc.invalidateQueries({ queryKey: ['challenges'] })
      reset()
      setOpen(false)
    },
    onError: (err) => {
      toast.error(handleApiError(err))
    },
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-1">
          <Plus className="size-4" />
          Create Challenge
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Challenge</DialogTitle>
          <DialogDescription>
            Create a new challenge to engage your students
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Build a React Todo App"
              {...register('title')}
              disabled={mutation.isPending}
            />
            {errors.title && (
              <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the challenge and what students should build..."
              {...register('description')}
              disabled={mutation.isPending}
              rows={3}
            />
            {errors.description && (
              <p className="text-xs text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="cohortId">Cohort (Optional)</Label>
            <Select
              defaultValue=""
              onValueChange={(value) => {
                setValue('cohortId', value || undefined)
              }}
              disabled={mutation.isPending}
            >
              <SelectTrigger id="cohortId">
                <SelectValue placeholder="Select a cohort (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No cohort</SelectItem>
                {cohorts.map((cohort) => (
                  <SelectItem key={cohort.id} value={cohort.id}>
                    {cohort.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startsAt">Start Date</Label>
              <Input
                id="startsAt"
                type="datetime-local"
                {...register('startsAt')}
                disabled={mutation.isPending}
              />
              {errors.startsAt && (
                <p className="text-xs text-destructive mt-1">{errors.startsAt.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="endsAt">End Date</Label>
              <Input
                id="endsAt"
                type="datetime-local"
                {...register('endsAt')}
                disabled={mutation.isPending}
                className={endDateError ? 'border-destructive' : ''}
              />
              {(errors.endsAt || endDateError) && (
                <p className="text-xs text-destructive mt-1">
                  {errors.endsAt?.message || 'End date must be after start date'}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              defaultValue="ACTIVE"
              onValueChange={(value) => {
                setValue('status', value as any)
              }}
              disabled={mutation.isPending}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={!isValid || mutation.isPending} className="w-full">
            {mutation.isPending && (
              <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
            )}
            Create Challenge
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
