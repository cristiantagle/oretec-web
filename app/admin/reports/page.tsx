// app/admin/reports/page.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/browser'
import UsersReportPanel from './UsersReportPanel' // 👈 integra el panel

type AccountType = 'admin' | 'instructor' | 'company' | 'student'

export default function ReportsPage() {
  const router = useRouter()
  const supabase = useMemo(() => supabaseBrowser(), [])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)

  // UI local del módulo
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true); setError(null)
      try {
        const { data } = await supabase.auth.getSession()
        const token = data?.session?.access_token || null
        const user = data?.session?.user || null

        if (!token || !user) {
          router.replace('/login')
          return
        }

        // Traemos el perfil con service role desde nuestro API y revisamos el rol
        const r = await fetch('/api/profile/get', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        })
        if (!r.ok) {
          const j = await r.json().catch(() => ({}))
          throw new Error(j?.error || j?.detail || `status_${r.status}`)
        }
        const j = await r.json()
        const at = String(j.account_type ?? 'student').toLowerCase() as AccountType
        if (mounted) setIsAdmin(at === 'admin')
      } catch (e: any) {
        if (mounted) setError(e?.message || 'No se pudo validar permisos')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [supabase, router])

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="rounded-xl border p-4">Cargando…</div>
      </main>
    )
  }

  if (error || !isAdmin) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {error ? `Error: ${error}` : '403 – Acceso restringido: solo administradores.'}
      </div>
      <div className="flex gap-2">
      <Link href="/dashboard" className="btn-secondary">← Volver</Link>
      <Link href="/admin" className="btn-secondary">Ir al panel Admin</Link>
      </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
    <div className="mb-2 text-xs text-blue-900/70">Panel Admin</div>
    <h1 className="text-2xl font-bold mb-6" style={{ color: '#1E3A8A' }}>
    Reportes
    </h1>

    <p className="mb-4 text-slate-600">
    Aquí podrás acceder a distintos reportes de la plataforma.
    </p>

    {/* Tarjetas de selección */}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <button
    onClick={() => setSelected('usuarios')}
    className={`rounded-lg border p-4 text-left hover:shadow-md transition ${
      selected === 'usuarios' ? 'ring-2 ring-blue-300' : ''
    }`}
    >
    <h2 className="font-semibold text-blue-900">Usuarios</h2>
    <p className="text-sm text-slate-600">Actividad, roles y registros</p>
    </button>

    <button
    onClick={() => setSelected('cursos')}
    className={`rounded-lg border p-4 text-left hover:shadow-md transition ${
      selected === 'cursos' ? 'ring-2 ring-blue-300' : ''
    }`}
    >
    <h2 className="font-semibold text-blue-900">Cursos</h2>
    <p className="text-sm text-slate-600">Progreso y finalización</p>
    </button>

    <button
    onClick={() => setSelected('ventas')}
    className={`rounded-lg border p-4 text-left hover:shadow-md transition ${
      selected === 'ventas' ? 'ring-2 ring-blue-300' : ''
    }`}
    >
    <h2 className="font-semibold text-blue-900">Ventas</h2>
    <p className="text-sm text-slate-600">Inscripciones y pagos</p>
    </button>
    </div>

    {/* Contenido del reporte seleccionado */}
    {selected === 'usuarios' && (
      <div className="mt-6">
      <UsersReportPanel />
      </div>
    )}

    {selected && selected !== 'usuarios' && (
      <div className="mt-6 rounded-lg border bg-slate-50 p-4">
      <h3 className="font-semibold text-blue-900 mb-2">
      Reporte seleccionado: {selected}
      </h3>
      <p className="text-sm text-slate-600">
      {selected === 'cursos' && 'Aquí iría el detalle del reporte de cursos.'}
      {selected === 'ventas' && 'Aquí iría el detalle del reporte de ventas.'}
      </p>
      </div>
    )}
    </main>
  )
}
