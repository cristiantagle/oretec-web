'use client'

/*
  Componente de bienvenida del Panel.
  - Obtiene token del usuario con supabaseBrowser().
  - Llama a /api/profile/get para traer el perfil.
  - Muestra saludo con el primer nombre y accesos rápidos.
*/

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabase/browser'

type AccountType = 'admin' | 'instructor' | 'company' | 'student'
type Profile = {
  id: string
  email: string | null
  full_name: string | null
  account_type: AccountType | null
  company_name?: string | null
  phone?: string | null
  avatar_url?: string | null
  updated_at?: string | null
}

function firstNameFrom(fullName?: string | null, email?: string | null) {
  if (fullName && fullName.trim().length) return fullName.trim().split(/\s+/)[0]
  if (email && email.includes('@')) return email.split('@')[0]
  return 'Usuario'
}

export default function DashboardWelcome() {
  const supabase = useMemo(() => supabaseBrowser(), [])
  const [cargando, setCargando] = useState(true)
  const [perfil, setPerfil] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let vivo = true
    ;(async () => {
      try {
        setCargando(true)
        setError(null)
        const { data } = await supabase.auth.getSession()
        const t = data?.session?.access_token
        if (!t) { setPerfil(null); return }
        const r = await fetch("/api/profile/get", {
          headers: { Authorization: "Bearer " + t },
          cache: "no-store",
        })
        if (!r.ok) { setError("No se pudo obtener el perfil"); setPerfil(null); return }
        const j = await r.json()
        const at = String(j.account_type ?? "student").toLowerCase() as AccountType
        const normal: Profile = {
          id: j.id,
          email: j.email ?? null,
          full_name: j.full_name ?? null,
          account_type: (at === "admin" || at === "instructor" || at === "company" || at === "student") ? at : "student",
          company_name: j.company_name ?? null,
          phone: j.phone ?? null,
          avatar_url: j.avatar_url ?? null,
          updated_at: j.updated_at ?? null,
        }
        if (vivo) setPerfil(normal)
      } catch (e: any) {
        if (vivo) setError(e?.message || String(e))
      } finally {
        if (vivo) setCargando(false)
      }
    })()
    return () => { vivo = false }
  }, [supabase])

  const nombre = firstNameFrom(perfil?.full_name, perfil?.email)

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <div className="rounded-3xl border bg-white/80 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-blue-900">Panel</h1>
        {cargando && (
          <p className="mt-2 text-slate-600">Cargando tu información…</p>
        )}
        {!cargando && perfil && (
          <>
            <p className="mt-2 text-slate-700">Hola, <span className="font-semibold">{nombre}</span>. Tu perfil y sesión están inicializados.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link href="/dashboard/profile" className="rounded-xl border px-4 py-3 hover:bg-slate-50">
                <div className="text-sm font-medium text-blue-900">Mi perfil</div>
                <div className="text-xs text-slate-600">Actualiza tu información</div>
              </Link>
              <Link href="/courses" className="rounded-xl border px-4 py-3 hover:bg-slate-50">
                <div className="text-sm font-medium text-blue-900">Cursos</div>
                <div className="text-xs text-slate-600">Explora la oferta disponible</div>
              </Link>
            </div>
          </>
        )}
        {!cargando && !perfil && !error && (
          <p className="mt-2 text-slate-600">No hay sesión activa. <Link href="/login" className="underline text-blue-700">Inicia sesión</Link>.</p>
        )}
        {!cargando && error && (
          <p className="mt-2 text-red-700">Error: {error}</p>
        )}
      </div>
    </section>
  )
}
