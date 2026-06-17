'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { handleApiError } from '@/lib/handleApiError'
import type { Challenge } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const submitChallengeSchema = z.object({
  submissionUrl: z.string().url('Enter a valid URL'),
  note: z.string().optional(),
})

type FormData = z.infer<typeof submitChallengeSchema>

interface SubmitChallengeDialogProps {
  challenge: Challenge
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubmitChallengeDialog({
  challenge,
  open,
  onOpenChange,
}: SubmitChallengeDialogProps) {
  const qc = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(submitChallengeSchema),
    mode: 'onChange',
  })

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      await api.post(`/challenges/${challenge.id}/submit`, {
        submissionUrl: data.submissionUrl,
        note: data.note || undefined,
      })
    },
    onSuccess: () => {
      toast.success('Challenge submitted successfully')
      qc.invalidateQueries({ queryKey: ['challenges'] })
      reset()
      onOpenChange(false)
    },
    onError: (err) => {
      toast.error(handleApiError(err))
    },
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Challenge</DialogTitle>
          <DialogDescription>
            Submit your solution for "{challenge.title}"
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="submissionUrl">GitHub URL or Demo Link</Label>
            <Input
              id="submissionUrl"
              type="url"
              placeholder="https://github.com/username/repo or https://demo.example.com"
              {...register('submissionUrl')}
              disabled={mutation.isPending}
              autoFocus
            />
            {errors.submissionUrl && (
              <p className="text-xs text-destructive mt-1">{errors.submissionUrl.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="note">Notes (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Add any notes about your submission (what you learned, challenges faced, etc.)"
              {...register('note')}
              disabled={mutation.isPending}
              rows={3}
            />
            {errors.note && (
              <p className="text-xs text-destructive mt-1">{errors.note.message}</p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
              )}
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
