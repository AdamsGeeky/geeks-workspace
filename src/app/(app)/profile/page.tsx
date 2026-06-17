'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Flame, Award, Lock, Loader2, Pencil } from 'lucide-react'
import api, { unwrapOne, unwrapList } from '@/lib/api'
import { handleApiError } from '@/lib/handleApiError'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { RoleBadge } from '@/components/shared/RoleBadge'
import { GamificationWidget } from '@/components/features/gamification/GamificationWidget'
import type { SafeUser, StreakData, ReputationData, AchievementProgress, UserRole } from '@/types'

const editSchema = z.object({
  fullName: z.string().min(1, 'Name is required').optional().or(z.literal('')),
  avatarUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio is too long').optional().or(z.literal('')),
  role: z.enum(['STUDENT', 'MENTOR', 'ADMIN']).optional(),
})
type EditValues = z.infer<typeof editSchema>

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const userId = user?.id

  const { data: profile } = useQuery({
    queryKey: ['users', userId],
    queryFn: async () => unwrapOne<SafeUser>((await api.get(`/users/${userId}`)).data),
    enabled: !!userId,
    staleTime: 60_000,
    initialData: user ?? undefined,
  })

  const { data: streak } = useQuery({
    queryKey: ['streaks', 'me'],
    queryFn: async () => unwrapOne<StreakData>((await api.get('/streaks/me')).data),
    staleTime: 30_000,
  })

  const { data: reputation } = useQuery({
    queryKey: ['reputation', 'me'],
    queryFn: async () => unwrapOne<ReputationData>((await api.get('/reputation/me')).data),
    staleTime: 30_000,
  })

  const { data: achievements } = useQuery({
    queryKey: ['achievements', 'me'],
    queryFn: async () => unwrapList<AchievementProgress>((await api.get('/achievements/me')).data),
    staleTime: 30_000,
  })

  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    values: {
      fullName: profile?.fullName ?? '',
      avatarUrl: profile?.avatarUrl ?? '',
      bio: profile?.bio ?? '',
      role: profile?.role,
    },
  })

  const updateProfile = useMutation({
    mutationFn: (values: EditValues) => {
      const body: Record<string, unknown> = {}
      if (values.fullName) body.fullName = values.fullName
      if (values.avatarUrl) body.avatarUrl = values.avatarUrl
      if (values.bio !== undefined) body.bio = values.bio
      if (user?.role === 'ADMIN' && values.role) body.role = values.role
      return api.patch(`/users/${userId}`, body)
    },
    onSuccess: () => {
      toast.success('Profile updated')
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['users', userId] })
      setOpen(false)
    },
    onError: (e) => toast.error(handleApiError(e)),
  })

  const claim = useMutation({
    mutationFn: (id: string) => api.post(`/achievements/${id}/claim`),
    onSuccess: () => {
      toast.success('Achievement claimed!')
      queryClient.invalidateQueries({ queryKey: ['achievements', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['reputation', 'me'] })
    },
    onError: (e) => toast.error(handleApiError(e)),
  })

  if (!profile) return null

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      {/* Header card */}
      <Card>
        <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center">
          <UserAvatar name={profile.fullName} avatarUrl={profile.avatarUrl} size="xl" />
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold">{profile.fullName}</h1>
              <RoleBadge role={profile.role} />
            </div>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            {profile.bio && <p className="mt-1 text-sm text-pretty">{profile.bio}</p>}
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Pencil data-icon="inline-start" /> Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={form.handleSubmit((v) => updateProfile.mutate(v))}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input id="fullName" {...form.register('fullName')} />
                  {form.formState.errors.fullName && (
                    <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="avatarUrl">Avatar URL</Label>
                  <Input id="avatarUrl" placeholder="https://..." {...form.register('avatarUrl')} />
                  {form.formState.errors.avatarUrl && (
                    <p className="text-xs text-destructive">{form.formState.errors.avatarUrl.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" rows={3} {...form.register('bio')} />
                  {form.formState.errors.bio && (
                    <p className="text-xs text-destructive">{form.formState.errors.bio.message}</p>
                  )}
                </div>
                {user?.role === 'ADMIN' && (
                  <div className="flex flex-col gap-1.5">
                    <Label>Role</Label>
                    <Select
                      value={form.watch('role')}
                      onValueChange={(v) => form.setValue('role', v as UserRole)}
                    >
                      <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="STUDENT">Student</SelectItem>
                          <SelectItem value="MENTOR">Mentor</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <DialogFooter>
                  <Button type="submit" disabled={updateProfile.isPending}>
                    {updateProfile.isPending && <Loader2 data-icon="inline-start" className="animate-spin" />}
                    Save changes
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm">Streak</CardTitle></CardHeader>
              <CardContent className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <Flame className="size-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-none">{streak?.currentCount ?? 0}</p>
                  <p className="text-xs text-muted-foreground">
                    Best {streak?.bestCount ?? 0} · {streak?.isActiveToday ? 'Active today' : 'Inactive'}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Reputation</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold leading-none">{reputation?.score ?? 0}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
                <Badge variant="secondary">{reputation?.level ?? 'Newcomer'}</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <Card>
            <CardHeader><CardTitle className="text-base">Achievements</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {(achievements ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">No achievements yet.</p>
              )}
              {(achievements ?? []).map((a) => {
                const locked = !a.unlockedAt
                return (
                  <div
                    key={a.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 ${locked ? 'opacity-50' : ''}`}
                  >
                    <div className="flex size-10 items-center justify-center rounded-md bg-primary/10">
                      {locked ? <Lock className="size-4 text-muted-foreground" /> : <Award className="size-4 text-primary" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{a.description}</p>
                    </div>
                    {!locked && !a.claimedAt && (
                      <Button size="sm" variant="outline" disabled={claim.isPending} onClick={() => claim.mutate(a.id)}>
                        Claim
                      </Button>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <GamificationWidget />
        </div>
      </div>
    </div>
  )
}
