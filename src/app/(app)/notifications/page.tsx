'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { Bell, Megaphone, ClipboardList, MessageSquare, Users, Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { handleApiError } from '@/lib/handleApiError'
import type { Notification, NotificationType } from '@/types'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/shared/EmptyState'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

const NOTIFICATION_ICONS: Record<NotificationType, React.ElementType> = {
  ANNOUNCEMENT: Megaphone,
  ASSIGNMENT: ClipboardList,
  SUBMISSION_FEEDBACK: MessageSquare,
  COMMUNITY: Users,
  SYSTEM: Bell,
}

const NOTIFICATION_ICON_COLORS: Record<NotificationType, string> = {
  ANNOUNCEMENT: 'text-primary',
  ASSIGNMENT: 'text-blue-500',
  SUBMISSION_FEEDBACK: 'text-orange-500',
  COMMUNITY: 'text-purple-500',
  SYSTEM: 'text-muted-foreground',
}

const createSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['ANNOUNCEMENT', 'ASSIGNMENT', 'SUBMISSION_FEEDBACK', 'COMMUNITY', 'SYSTEM']),
})
type CreateData = z.infer<typeof createSchema>

export default function NotificationsPage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get<Notification[]>('/notifications')
      return Array.isArray(res.data) ? res.data : (res.data as any).data ?? []
    },
    staleTime: 15_000,
  })

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    onError: (err) => toast.error(handleApiError(err)),
  })

  const markAllRead = async () => {
    const unread = (notifications ?? []).filter((n) => !n.isRead)
    await Promise.all(unread.map((n) => markRead.mutateAsync(n.id)))
    qc.invalidateQueries({ queryKey: ['notifications'] })
    toast.success('All notifications marked as read.')
  }

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<CreateData>({
    resolver: zodResolver(createSchema),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateData) => api.post('/notifications', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Notification sent.')
      setCreateOpen(false)
      reset()
    },
    onError: (err) => setApiError(handleApiError(err)),
  })

  const renderNotification = (n: Notification) => {
    const Icon = NOTIFICATION_ICONS[n.type] ?? Bell
    const iconColor = NOTIFICATION_ICON_COLORS[n.type]
    return (
      <Card key={n.id} className={cn(n.isRead ? '' : 'border-l-4 border-l-primary')}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <div className={cn('mt-0.5', iconColor)}>
              <Icon className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm leading-snug', n.isRead ? 'text-foreground' : 'font-semibold text-foreground')}>
                {n.title}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(parseISO(n.createdAt), { addSuffix: true })}
              </p>
            </div>
            {!n.isRead && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markRead.mutate(n.id)}
                disabled={markRead.isPending}
                className="shrink-0"
              >
                {markRead.isPending ? <Loader2 className="size-4 animate-spin" /> : 'Mark read'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const unread = (notifications ?? []).filter((n) => !n.isRead)
  const all = notifications ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">{unread.length} unread</p>
        </div>
        <div className="flex gap-2">
          {unread.length > 0 && (
            <Button variant="outline" onClick={markAllRead} disabled={markRead.isPending}>
              Mark all as read
            </Button>
          )}
          {user?.role === 'ADMIN' && (
            <Button onClick={() => { setCreateOpen(true); setApiError(null) }} className="gap-2">
              <Plus className="size-4" /> Create
            </Button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <div className="flex gap-3">
                  <Skeleton className="size-5 rounded-full mt-0.5" />
                  <div className="flex-1 flex flex-col gap-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({all.length})</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unread.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="flex flex-col gap-3 mt-4">
            {all.length === 0 ? (
              <EmptyState icon={Bell} title="All caught up!" description="No notifications right now." />
            ) : all.map(renderNotification)}
          </TabsContent>
          <TabsContent value="unread" className="flex flex-col gap-3 mt-4">
            {unread.length === 0 ? (
              <EmptyState icon={Bell} title="All caught up!" description="You have no unread notifications." />
            ) : unread.map(renderNotification)}
          </TabsContent>
        </Tabs>
      )}

      {/* Create Notification dialog (Admin only) */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Send Notification</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((d) => { setApiError(null); createMutation.mutate(d) })} className="flex flex-col gap-4">
            {apiError && <Alert variant="destructive"><AlertDescription>{apiError}</AlertDescription></Alert>}
            <div className="flex flex-col gap-1.5">
              <Label>User ID</Label>
              <Input placeholder="UUID" {...register('userId')} />
              {errors.userId && <p className="text-sm text-destructive">{errors.userId.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Title</Label>
              <Input placeholder="Notification title" {...register('title')} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Message</Label>
              <Textarea placeholder="Message body" {...register('message')} />
              {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Type</Label>
              <Select onValueChange={(v) => setValue('type', v as NotificationType)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {(['ANNOUNCEMENT', 'ASSIGNMENT', 'SUBMISSION_FEEDBACK', 'COMMUNITY', 'SYSTEM'] as const).map((t) => (
                    <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? <><Loader2 className="size-4 animate-spin" />Sending...</> : 'Send'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
