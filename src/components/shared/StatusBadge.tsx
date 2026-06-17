import { Badge } from '@/components/ui/badge'
import type { AssignmentStatus, SubmissionStatus, ChallengeStatus, ChallengeParticipantStatus } from '@/types'

type Status = AssignmentStatus | SubmissionStatus | ChallengeStatus | ChallengeParticipantStatus

const STATUS_VARIANTS: Record<string, 'success' | 'destructive' | 'warning' | 'orange' | 'slate' | 'info' | 'secondary'> = {
  // Assignment statuses
  DRAFT: 'slate',
  PUBLISHED: 'success',
  CLOSED: 'destructive',
  // Submission statuses
  SUBMITTED: 'slate',
  UNDER_REVIEW: 'warning',
  COMPLETED: 'success',
  NEEDS_REVISION: 'orange',
  REJECTED: 'destructive',
  // Challenge statuses
  ACTIVE: 'success',
  ENDED: 'slate',
  CANCELLED: 'destructive',
  // Challenge participant statuses
  JOINED: 'slate',
  WITHDRAWN: 'destructive',
}

export function StatusBadge({ status }: { status: Status }) {
  const variant = STATUS_VARIANTS[status] ?? 'secondary'
  return <Badge variant={variant as any}>{status.replace(/_/g, ' ')}</Badge>
}
