'use client'

import { use, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, formatDistanceToNow, parseISO, isFuture } from 'date-fns'
import { ArrowLeft, Github, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { handleApiError } from '@/lib/handleApiError'
import type { Assignment, Submission } from '@/types'
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
import { StatusBadge } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'

const submitSchema = z.object({
  githubUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  fileUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  note: z.string().optional(),
})

const reviewSchema = z.object({
  status: z.enum(['UNDER_REVIEW', 'COMPLETED', 'NEEDS_REVISION', 'REJECTED']),
  feedback: z.string().optional(),
})

type SubmitData = z.infer<typeof submitSchema>
type ReviewData = z.infer<typeof reviewSchema>

export default function AssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewTarget, setReviewTarget] = useState<Submission | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [reviewError, setReviewError] = useState<string | null>(null)

  const { data: allAssignments, isLoading: assignLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const res = await api.get<Assignment[]>('/assignments')
      return Array.isArray(res.data) ? res.data : (res.data as any).data ?? []
    },
    staleTime: 30_000,
  })

  const assignment = (allAssignments ?? []).find((a) => a.id === id)

  const { data: submissions } = useQuery({
    queryKey: ['submissions'],
    queryFn: async () => {
      const res = await api.get<Submission[]>('/submissions')
      return Array.isArray(res.data) ? res.data : (res.data as any).data ?? []
    },
    staleTime: 30_000,
  })

  const mySubmission = (submissions ?? []).find(
    (s) => s.assignmentId === id && s.studentId === user?.id
  )

  const assignmentSubmissions = (submissions ?? []).filter((s) => s.assignmentId === id)

  const {
    register: regSubmit,
    handleSubmit: handleSubmitForm,
    formState: { errors: submitErrors },
  } = useForm<SubmitData>({ resolver: zodResolver(submitSchema) })

  const {
    register: regReview,
    handleSubmit: handleReviewForm,
    setValue: setReviewValue,
    reset: resetReview,
    formState: { errors: reviewErrors },
  } = useForm<ReviewData>({ resolver: zodResolver(reviewSchema) })

  const submitMutation = useMutation({
    mutationFn: (data: SubmitData) =>
      api.post('/submissions', { assignmentId: id, ...data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['submissions'] })
      qc.invalidateQueries({ queryKey: ['assignments'] })
      qc.invalidateQueries({ queryKey: ['dashboard', 'me'] })
      toast.success('Assignment submitted!')
    },
    onError: (err) => setSubmitError(handleApiError(err)),
  })

  const reviewMutation = useMutation({
    mutationFn: ({ submissionId, data }: { submissionId: string; data: ReviewData }) =>
      api.patch(`/submissions/${submissionId}/review`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['submissions'] })
      qc.invalidateQueries({ queryKey: ['dashboard', 'me'] })
      toast.success('Review submitted.')
      setReviewOpen(false)
      resetReview()
    },
    onError: (err) => setReviewError(handleApiError(err)),
  })

  if (assignLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <Card><CardContent className="pt-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="destructive"><AlertDescription>Assignment not found.</AlertDescription></Alert>
        <Button asChild variant="outline"><Link href="/assignments"><ArrowLeft className="size-4" /> Back</Link></Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/assignments"><ArrowLeft className="size-4" /> Assignments</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{assignment.title}</h1>
          <StatusBadge status={assignment.status} />
        </div>
        {assignment.deadline && (
          <p className="text-sm text-muted-foreground">
            Due: {format(parseISO(assignment.deadline), 'MMM d, yyyy')}
            {isFuture(parseISO(assignment.deadline)) && (
              <span className="ml-1">({formatDistanceToNow(parseISO(assignment.deadline), { addSuffix: true })})</span>
            )}
          </p>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{assignment.description}</p>
        </CardContent>
      </Card>

      {/* Student submission section */}
      {user?.role === 'STUDENT' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Submission</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {mySubmission && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={mySubmission.status} />
                  <span className="text-xs text-muted-foreground">
                    Submitted {format(parseISO(mySubmission.submittedAt), 'MMM d, yyyy')}
                  </span>
                </div>
                {mySubmission.githubUrl && (
                  <a href={mySubmission.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                    <Github className="size-4" /> GitHub Link
                  </a>
                )}
                {mySubmission.fileUrl && (
                  <a href={mySubmission.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                    <ExternalLink className="size-4" /> File Link
                  </a>
                )}
                {mySubmission.feedback && (
                  <div className="border rounded-md p-3 bg-muted/30">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Mentor Feedback</p>
                    <p className="text-sm">{mySubmission.feedback}</p>
                  </div>
                )}
              </div>
            )}
            <form onSubmit={handleSubmitForm((d) => { setSubmitError(null); submitMutation.mutate(d) })} className="flex flex-col gap-3">
              {submitError && <Alert variant="destructive"><AlertDescription>{submitError}</AlertDescription></Alert>}
              <div className="flex flex-col gap-1.5">
                <Label>GitHub URL (optional)</Label>
                <Input type="url" placeholder="https://github.com/you/project" {...regSubmit('githubUrl')} />
                {submitErrors.githubUrl && <p className="text-sm text-destructive">{submitErrors.githubUrl.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>File URL (optional)</Label>
                <Input type="url" placeholder="https://example.com/file.zip" {...regSubmit('fileUrl')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Note (optional)</Label>
                <Textarea placeholder="Any notes for your mentor..." {...regSubmit('note')} />
              </div>
              <Button type="submit" disabled={submitMutation.isPending} className="w-fit">
                {submitMutation.isPending ? <><Loader2 className="size-4 animate-spin" />Submitting...</> : mySubmission ? 'Resubmit' : 'Submit Assignment'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Mentor/Admin review section */}
      {(user?.role === 'MENTOR' || user?.role === 'ADMIN') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Submissions ({assignmentSubmissions.length})</CardTitle>
            <CardDescription>Review student work</CardDescription>
          </CardHeader>
          <CardContent>
            {assignmentSubmissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No submissions yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {assignmentSubmissions.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 border rounded-md p-3">
                    {s.student && (
                      <UserAvatar name={s.student.fullName} avatarUrl={s.student.avatarUrl} className="size-8 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{s.student?.fullName ?? 'Student'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StatusBadge status={s.status} />
                        <span className="text-xs text-muted-foreground">{format(parseISO(s.submittedAt), 'MMM d')}</span>
                      </div>
                      {s.githubUrl && (
                        <a href={s.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                          <Github className="size-3" /> GitHub
                        </a>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setReviewTarget(s); setReviewError(null); setReviewOpen(true) }}
                    >
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Review dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Review Submission</DialogTitle></DialogHeader>
          <form
            onSubmit={handleReviewForm((d) => {
              if (!reviewTarget) return
              setReviewError(null)
              reviewMutation.mutate({ submissionId: reviewTarget.id, data: d })
            })}
            className="flex flex-col gap-4"
          >
            {reviewError && <Alert variant="destructive"><AlertDescription>{reviewError}</AlertDescription></Alert>}
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select onValueChange={(v) => setReviewValue('status', v as ReviewData['status'])}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  {(['UNDER_REVIEW', 'COMPLETED', 'NEEDS_REVISION', 'REJECTED'] as const).map((s) => (
                    <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {reviewErrors.status && <p className="text-sm text-destructive">{reviewErrors.status.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Feedback (optional)</Label>
              <Textarea placeholder="Tighten the mobile layout and resubmit..." {...regReview('feedback')} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setReviewOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={reviewMutation.isPending}>
                {reviewMutation.isPending ? <><Loader2 className="size-4 animate-spin" />Submitting...</> : 'Submit Review'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
