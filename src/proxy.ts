import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register']
const AUTH_PATHS = ['/login', '/register']
const ADMIN_PATHS = ['/admin']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Cookies set at login/register for SSR-compatible auth checks
  const token = request.cookies.get('accessToken')?.value
  const role = request.cookies.get('role')?.value

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p))
  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p))

  // If not authenticated and trying to access protected route → redirect to login
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If authenticated and on auth page → redirect to dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If authenticated but not ADMIN and trying to access /admin → redirect to dashboard
  if (token && isAdminPath && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.ico$).*)',
  ],
}
