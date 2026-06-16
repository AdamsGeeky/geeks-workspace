import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

interface UserAvatarProps {
  name: string
  avatarUrl?: string | null
  size?: AvatarSize
  className?: string
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'size-6',
  md: 'size-9',
  lg: 'size-11',
  xl: 'size-20',
}

const textClasses: Record<AvatarSize, string> = {
  sm: 'text-[10px]',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-xl',
}

export function UserAvatar({ name, avatarUrl, size = 'md', className }: UserAvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
      <AvatarFallback className={cn('bg-primary text-primary-foreground font-semibold', textClasses[size])}>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
