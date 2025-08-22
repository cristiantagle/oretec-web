// middleware.ts
import { NextResponse, NextRequest } from 'next/server'

const ADMIN_TOKEN = process.env.ADMIN_TOKEN

const PUBLIC_PATHS = [
  '/admin/login',
  '/api/admin/auth/login',
  '/api/admin/auth/logout',
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // permitir assets internos y rutas públicas
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/public') ||
    PUBLIC_PATHS.includes(pathname)
  ) {
    return NextResponse.next()
  }

  // proteger /admin y /api/admin
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin')
  if (!isAdminRoute) return NextResponse.next()

  // si no hay ADMIN_TOKEN configurado, no bloquear (evita lockouts en dev)
  if (!ADMIN_TOKEN) return NextResponse.next()

  // validar cookie
  const cookie = req.cookies.get('admin_token')?.value || ''
  if (cookie === ADMIN_TOKEN) return NextResponse.next()

  // si es API admin, responder 401
  if (pathname.startsWith('/api/admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // si es página /admin, redirigir a login
  const loginUrl = new URL('/admin/login', req.url)
  loginUrl.searchParams.set('next', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
