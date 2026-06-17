'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { handleApiError } from '@/lib/handleApiError'
import type { SafeUser, UserRole } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'

const schema = z.object({
  fullName: z.string().min(1, 'Name cannot be empty').optional().or(z.literal('')),
  avatarUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio is too long').optional().or(z.literal('')),
  role: z.enum(['STUDENT', 'MENTOR', 'ADMIN']).optional(),
})

type FormData = z.infer<typeof schema>

const ROLES: UserRole[] = ['STUDENT', 'MENTOR', 'ADMIN']

export function EditProfileDialog({ user, trigger }: { user: SafeUser; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const { user: currentUser, setAuth } = useAuthStore()
  const isAdmin = currentUser?.role === 'ADMIN'

  const {
    register, handleSubmit, reset, setValue, watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: user.fullName ?? '',
      avatarUrl: user.avatarUrl ?? '',
      bio: user.bio ?? '',
      role: user.role,
    },
  })

  const roleValue = watch('role')

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const body: Record<string, unknown> = {}
      if (data.fullName) body.fullName = data.fullName
      body.avatarUrl = data.avatarUrl || null
      body.bio = data.bio || null
      if (isAdmin && data.role) body.role = data.role
      const res = await api.patch(`/users/${user.id}`, body)
      return res.data
    },
    onSuccess: (updated: SafeUser) => {
      toast.success('Profile updated')
      // Keep Zustand auth user in sync
      const token = useAuthStore.getState().accessToken
      if (token && updated?.id) setAuth(updated, token)
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['users', user.id] })
      setOpen(false)
    },
    onError: (err) => toast.error(handleApiError(err)),
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) reset({ fullName: user.fullName ?? '', avatarUrl: user.avatarUrl ?? '', bio: user.bio ?? '', role: user.role })
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your public profile information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" {...register('fullName')} aria-invalid={!!errors.fullName} />
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input id="avatarUrl" placeholder="https://..." {...register('avatarUrl')} aria-invalid={!!errors.avatarUrl} />
            {errors.avatarUrl && <p className="text-sm text-destructive">{errors.avatarUrl.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" rows={3} placeholder="Tell us about yourself" {...register('bio')} aria-invalid={!!errors.bio} />
            {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
          </div>

          {isAdmin && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role">Role</Label>
              <Select value={roleValue} onValueChange={(v) => setValue('role', v as UserRole)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
