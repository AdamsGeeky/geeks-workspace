'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { Users, MessageCircle, Loader2, Send, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import api, { unwrapList } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { handleApiError } from '@/lib/handleApiError'
import type { CommunityPost, Comment, ReactionType, FeaturedBuilder } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { EmptyState } from '@/components/shared/EmptyState'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { RoleBadge } from '@/components/shared/RoleBadge'

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'LIKE', emoji: '👍', label: 'Like' },
  { type: 'FIRE', emoji: '🔥', label: 'Fire' },
  { type: 'CLAP', emoji: '👏', label: 'Clap' },
  { type: 'INSPIRE', emoji: '✨', label: 'Inspire' },
]

function PostComments({ postId }: { postId: string }) {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const [comment, setComment] = useState('')

  const { data: comments } = useQuery({
    queryKey: ['comments', 'post', postId],
    queryFn: async () => {
      const res = await api.get(`/comments/posts/${postId}`)
      return unwrapList<Comment>(res.data)
    },
    staleTime: 30_000,
  })

  const commentMutation = useMutation({
    mutationFn: (content: string) => api.post('/comments', { postId, content }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community', 'posts'] })
      qc.invalidateQueries({ queryKey: ['comments', 'post', postId] })
      setComment('')
    },
    onError: (err) => toast.error(handleApiError(err)),
  })

  return (
    <div className="flex flex-col gap-3 mt-3 pt-3 border-t">
      {(comments ?? []).map((c) => (
        <div key={c.id} className="flex items-start gap-2">
          {c.author && (
            <UserAvatar name={c.author.fullName} avatarUrl={c.author.avatarUrl} className="size-7 shrink-0" />
          )}
          <div className="flex-1 bg-muted rounded-lg px-3 py-2">
            <p className="text-xs font-semibold text-foreground">{c.author?.fullName}</p>
            <p className="text-sm text-foreground mt-0.5">{c.content}</p>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 mt-1">
        {user && (
          <UserAvatar name={user.fullName} avatarUrl={user.avatarUrl} className="size-7 shrink-0" />
        )}
        <div className="flex-1 flex gap-2">
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && comment.trim()) {
                e.preventDefault()
                commentMutation.mutate(comment.trim())
              }
            }}
          />
          <Button
            size="icon"
            variant="ghost"
            disabled={!comment.trim() || commentMutation.isPending}
            onClick={() => commentMutation.mutate(comment.trim())}
          >
            {commentMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

function PostCard({ post }: { post: CommunityPost }) {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [showComments, setShowComments] = useState(false)

  const reactionMutation = useMutation({
    mutationFn: (type: ReactionType) =>
      api.post(`/community/posts/${post.id}/reactions`, { type }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['community', 'posts'] }),
    onError: (err) => toast.error(handleApiError(err)),
  })

  const myReaction = (post.reactions ?? []).find((r) => r.userId === user?.id)

  const reactionCount = (type: ReactionType) =>
    (post.reactions ?? []).filter((r) => r.type === type).length

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {post.author && (
            <UserAvatar name={post.author.fullName} avatarUrl={post.author.avatarUrl} className="size-9 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold">{post.author?.fullName}</p>
              {post.author && <RoleBadge role={post.author.role} />}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDistanceToNow(parseISO(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{post.content}</p>
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="Post image"
            className="rounded-lg max-h-80 w-full object-cover"
          />
        )}

        {/* Reactions */}
        <div className="flex items-center gap-1 flex-wrap">
          {REACTIONS.map((r) => {
            const count = reactionCount(r.type)
            const isActive = myReaction?.type === r.type
            return (
              <Button
                key={r.type}
                variant={isActive ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 px-2 gap-1 text-xs"
                onClick={() => reactionMutation.mutate(r.type)}
                disabled={reactionMutation.isPending}
              >
                <span>{r.emoji}</span>
                {count > 0 && <span>{count}</span>}
              </Button>
            )
          })}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 gap-1 text-xs ml-auto text-muted-foreground"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="size-3" />
            {(post.comments ?? []).length} comments
          </Button>
        </div>

        {showComments && <PostComments postId={post.id} />}
      </CardContent>
    </Card>
  )
}

function FeaturedBuilders() {
  const { data } = useQuery({
    queryKey: ['featured-builders'],
    queryFn: async () => {
      const res = await api.get('/featured-builders')
      return unwrapList<FeaturedBuilder>(res.data)
    },
    staleTime: 5 * 60_000,
  })

  if (!data || data.length === 0) return null

  return (
    <Card className="h-fit">
      <CardHeader><h2 className="text-sm font-semibold">Featured Builders</h2></CardHeader>
      <CardContent className="flex flex-col gap-3">
        {data.map((b) => (
          <div key={b.id} className="flex items-center gap-2">
            <UserAvatar name={b.user?.fullName ?? 'Builder'} avatarUrl={b.user?.avatarUrl} className="size-7" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{b.user?.fullName ?? 'Builder'}</p>
              <p className="text-xs text-muted-foreground truncate">{b.reason}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default function CommunityPage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [postContent, setPostContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [showImageInput, setShowImageInput] = useState(false)

  const { data: posts, isLoading } = useQuery({
    queryKey: ['community', 'posts'],
    queryFn: async () => {
      const res = await api.get('/community/posts')
      return unwrapList<CommunityPost>(res.data)
    },
    staleTime: 30_000,
  })

  const createPost = useMutation({
    mutationFn: () =>
      api.post('/community/posts', {
        content: postContent,
        ...(imageUrl ? { imageUrl } : {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community', 'posts'] })
      setPostContent('')
      setImageUrl('')
      setShowImageInput(false)
      toast.success('Post shared!')
    },
    onError: (err) => toast.error(handleApiError(err)),
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Community</h1>
        <p className="text-sm text-muted-foreground">Share, inspire, and connect with your cohort.</p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Feed */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Create post */}
          <Card>
            <CardContent className="pt-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                {user && <UserAvatar name={user.fullName} avatarUrl={user.avatarUrl} className="size-9 shrink-0" />}
                <Textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Share something with the community..."
                  className="resize-none"
                  rows={3}
                />
              </div>
              {showImageInput && (
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Image URL (optional)"
                  type="url"
                />
              )}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowImageInput(!showImageInput)}
                  className="text-muted-foreground gap-1"
                >
                  <ImageIcon className="size-4" />
                  {showImageInput ? 'Remove image' : 'Add image URL'}
                </Button>
                <Button
                  size="sm"
                  disabled={!postContent.trim() || createPost.isPending}
                  onClick={() => createPost.mutate()}
                >
                  {createPost.isPending ? <Loader2 className="size-4 animate-spin" /> : 'Post'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {isLoading && (
            <>
              {[0, 1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-4 flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <Skeleton className="size-9 rounded-full shrink-0" />
                      <div className="flex-1 flex flex-col gap-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}

          {!isLoading && (posts ?? []).length === 0 && (
            <EmptyState
              icon={Users}
              title="No posts yet"
              description="Be the first to share something!"
            />
          )}

          {(posts ?? []).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Right sidebar */}
        <aside className="hidden lg:block w-72 shrink-0">
          <FeaturedBuilders />
        </aside>
      </div>
    </div>
  )
}
