'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Megaphone, ClipboardList, Users, Trophy,
  BookOpen, Bell, User, Shield, UsersRound, LogOut, Menu, Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useUnreadNotificationCount } from '@/hooks/useUnreadNotificationCount'
import { UserAvatar } from './UserAvatar'
import { RoleBadge } from './RoleBadge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Announcements', href: '/announcements', icon: Megaphone },
  { label: 'Assignments', href: '/assignments', icon: ClipboardList },
  { label: 'Community', href: '/community', icon: Users },
  { label: 'Challenges', href: '/challenges', icon: Trophy },
  { label: 'Materials', href: '/materials', icon: BookOpen },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Cohorts', href: '/cohorts', icon: UsersRound, roles: ['MENTOR', 'ADMIN'] },
  { label: 'Admin', href: '/admin', icon: Shield, roles: ['ADMIN'] },
]

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()
  const unreadCount = useUnreadNotificationCount()
  const [open, setOpen] = useState(false)

  const handleSignOut = () => {
    clearAuth()
    document.cookie = 'accessToken=; path=/; max-age=0'
    setOpen(false)
    router.push('/login')
  }

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(user?.role ?? '')
  )

  return (
    <header className="md:hidden flex items-center justify-between px-4 h-14 border-b bg-background sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center size-7 rounded-md bg-primary">
          <Layers className="size-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-base tracking-tight">GeekInk</span>
      </div>

      <div className="flex items-center gap-2">
        {user && <UserAvatar name={user.fullName} avatarUrl={user.avatarUrl} className="size-7" />}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open navigation menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="px-6 py-4 border-b">
              <SheetTitle className="flex items-center gap-2">
                <div className="flex items-center justify-center size-7 rounded-md bg-primary">
                  <Layers className="size-4 text-primary-foreground" />
                </div>
                GeekInk
              </SheetTitle>
            </SheetHeader>

            <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Mobile navigation">
              <ul className="flex flex-col gap-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  const isNotifications = item.href === '/notifications'

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {isNotifications && unreadCount > 0 && (
                          <span className="flex items-center justify-center size-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {user && (
              <div className="border-t p-4 mt-auto">
                <div className="flex items-center gap-3 mb-3">
                  <UserAvatar name={user.fullName} avatarUrl={user.avatarUrl} className="size-9" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.fullName}</p>
                    <RoleBadge role={user.role} />
                  </div>
                </div>
                <Separator className="mb-3" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-muted-foreground"
                  onClick={handleSignOut}
                >
                  <LogOut className="size-4" />
                  Sign out
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
