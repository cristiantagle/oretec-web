#!/usr/bin/env bash
set -euo pipefail

echo "== Creando protección de /admin (middleware + login/logout) =="

# 1) middleware.ts
cat > middleware.ts <<'EOF'
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
EOF
echo "✔ middleware.ts"

# 2) Página de login
mkdir -p app/admin/login
cat > app/admin/login/page.tsx <<'EOF'
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/admin'

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const resp = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ password, next }),
      })
      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}))
        throw new Error(j?.error || 'Error de autenticación')
      }
      const j = await resp.json()
      router.push(j?.next || '/admin')
    } catch (err:any) {
      setError(err.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border p-6">
        <h1 className="text-xl font-bold mb-4" style={{color:'#1E3A8A'}}>Ingreso Admin</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border rounded-xl px-3 py-2"
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl px-3 py-2 text-white"
            style={{ background:'#1E3A8A', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </main>
  )
}
EOF
echo "✔ app/admin/login/page.tsx"

# 3) API login
mkdir -p app/api/admin/auth/login
cat > app/api/admin/auth/login/route.ts <<'EOF'
import 'server-only'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { password, next } = await req.json()
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN
    if (!ADMIN_TOKEN) {
      return NextResponse.json({ error: 'ADMIN_TOKEN no configurado' }, { status: 500 })
    }
    if (!password || password !== ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
    }

    const res = NextResponse.json({ ok: true, next: next || '/admin' })
    const isProd = process.env.VERCEL === '1'
    res.cookies.set('admin_token', ADMIN_TOKEN, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 60 * 60 * 8, // 8 horas
    })
    return res
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status: 400 })
  }
}
EOF
echo "✔ app/api/admin/auth/login/route.ts"

# 4) API logout (redirige por GET y POST)
mkdir -p app/api/admin/auth/logout
cat > app/api/admin/auth/logout/route.ts <<'EOF'
import 'server-only'
import { NextResponse } from 'next/server'

function logoutResponse(req: Request) {
  const res = NextResponse.redirect(new URL('/admin/login', req.url))
  res.cookies.set('admin_token', '', { path: '/', maxAge: 0 })
  return res
}

export async function POST(req: Request) {
  return logoutResponse(req)
}

export async function GET(req: Request) {
  return logoutResponse(req)
}
EOF
echo "✔ app/api/admin/auth/logout/route.ts"

# 5) Reemplazar /admin con botón logout y link a cursos
mkdir -p app/admin
if [ -f app/admin/page.tsx ]; then
  cp app/admin/page.tsx "app/admin/page.tsx.bak.$(date +%s)" || true
fi

cat > app/admin/page.tsx <<'EOF'
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Row = {
  order_id: string
  status: 'pending' | 'pending_review' | 'paid' | 'failed'
  created_at: string
  payment_proof: string | null
  payment_notes: string | null
  user_email: string | null
  user_name: string | null
  course_code: string | null
  course_title: string | null
  price_cents: number | null
}

export default function AdminPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const resp = await fetch('/api/admin/list', { cache: 'no-store' })
      const data = await resp.json()
      setRows(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function approve(id: string) {
    if (!confirm('¿Aprobar y matricular?')) return
    await fetch('/api/admin/orders/approve', {
      method: 'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ orderId: id })
    })
    await load()
  }

  async function reject(id: string) {
    const note = prompt('Motivo de rechazo:') || ''
    await fetch('/api/admin/orders/reject', {
      method: 'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ orderId: id, note })
    })
    await load()
  }

  const clp = (n: number) =>
    (n || 0).toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    })

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{color:'#1E3A8A'}}>
          Panel Admin — Órdenes
        </h1>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/courses"
            className="px-4 py-2 rounded-xl text-white"
            style={{ background:'#1E3A8A' }}
          >
            Gestionar cursos
          </Link>

          <a
            href="/api/admin/auth/logout"
            className="px-3 py-2 rounded-xl border"
            style={{ borderColor:'#1E3A8A', color:'#1E3A8A' }}
          >
            Cerrar sesión
          </a>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border p-4">Cargando…</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
                <th>Fecha</th>
                <th>Alumno</th>
                <th>Curso</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Comprobante</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody className="[&>tr>*]:px-3 [&>tr>*]:py-2">
              {rows.map((r) => (
                <tr key={r.order_id} className="border-t">
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                  <td>{r.user_name || r.user_email || '—'}</td>
                  <td>{r.course_title ? `${r.course_title} (${r.course_code})` : '—'}</td>
                  <td>{clp(r.price_cents ?? 0)}</td>
                  <td>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        r.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : r.status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {r.payment_proof ? (
                      <a
                        className="text-blue-600 underline"
                        href={r.payment_proof}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="space-x-2">
                    {r.status !== 'paid' && (
                      <>
                        <button
                          onClick={() => approve(r.order_id)}
                          className="px-3 py-1 rounded text-white"
                          style={{ background: '#1E3A8A' }}
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => reject(r.order_id)}
                          className="px-3 py-1 rounded border"
                          style={{ borderColor:'#1E3A8A', color:'#1E3A8A' }}
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-8">
                    No hay órdenes aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
EOF
echo "✔ app/admin/page.tsx"

echo "✅ Listo. Ahora agrega ADMIN_TOKEN en Vercel y redeploy."
