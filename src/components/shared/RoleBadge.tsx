import { Badge } from '@/components/ui/badge'
import type { UserRole } from '@/types'

interface RoleBadgeProps {
  role: UserRole
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const variants: Record<UserRole, 'success' | 'info' | 'purple'> = {
    STUDENT: 'success',
    MENTOR: 'info',
    ADMIN: 'purple',
  }

  return <Badge variant={variants[role]}>{role}</Badge>
}
