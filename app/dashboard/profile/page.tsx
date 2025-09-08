// app/dashboard/profile/page.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/browser'
import dynamic from 'next/dynamic'

const ProfileForm = dynamic(() => import('./ProfileForm'), { ssr: false })

type AccountType = 'admin' | 'instructor' | 'company' | 'student'

type Profile = {
  id: string
  full_name: string | null
  account_type: AccountType | null
  company_name: string | null
  created_at?: string
  updated_at?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = supabaseBrowser()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef(new AbortController())

  async function ensureAndLoad() {
    setLoading(true)
    setError(null)

    try {
      const { data: sess, error: sessErr } = await supabase.auth.getSession()
      if (sessErr) throw sessErr

        const token = sess.session?.access_token
        const user = sess.session?.user
        if (!user || !token) {
          router.replace('/login')
          return
        }

        // 1) Asegurar perfil (idempotente)
        {
          const r = await fetch('/api/profile/ensure', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            signal: abortRef.current.signal,
          })
          if (!r.ok) {
            try {
              const j = await r.json()
              if (r.status === 401) {
                router.replace('/login')
                return
              }
              setError(`ensure(${r.status}): ${JSON.stringify(j)}`)
            } catch {
              setError(`ensure(${r.status})`)
            }
          }
        }

        // 2) Leer perfil
        let p: Profile | null = null
        {
          const r = await fetch('/api/profile/get', {
            headers: { Authorization: `Bearer ${token}` },
            signal: abortRef.current.signal,
          })
          if (r.ok) {
            p = (await r.json()) as Profile
          } else if (r.status === 404) {
            const r2 = await fetch('/api/profile/ensure', {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              signal: abortRef.current.signal,
            })
            if (!r2.ok) {
              const t2 = await r2.text().catch(() => '')
              throw new Error(`No se pudo asegurar el perfil (${r2.status}): ${t2}`)
            }
            const r3 = await fetch('/api/profile/get', {
              headers: { Authorization: `Bearer ${token}` },
              signal: abortRef.current.signal,
            })
            if (!r3.ok) {
              const t3 = await r3.text().catch(() => '')
              throw new Error(`No se pudo leer el perfil (${r3.status}): ${t3}`)
            }
            p = (await r3.json()) as Profile
          } else if (r.status === 401) {
            router.replace('/login')
            return
          } else {
            const t = await r.text().catch(() => '')
            throw new Error(`No se pudo leer el perfil (${r.status}): ${t}`)
          }
        }

        // Normalizar account_type
        if (p) {
          const normalizeAccount = (at: any): AccountType | null => {
            if (!at) return 'student'
              const v = String(at).toLowerCase()
              if (v === 'admin' || v === 'instructor' || v === 'company' || v === 'student') return v
                if (v === 'individual') return 'student'
                  return 'student'
          }
          p = { ...p, account_type: normalizeAccount(p.account_type) }
        }

        setProfile(p)
    } catch (e: any) {
      if (e?.name === 'AbortError') return
        setError(e?.message || 'No se pudo cargar el perfil')
        setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    abortRef.current = new AbortController()
    ensureAndLoad()
    return () => {
      abortRef.current.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="rounded-xl border p-4">Cargando…</div>
      </main>
    )
  }

  if (error || !profile) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {error || 'No se encontró tu perfil.'}
      </div>
      <div className="flex gap-2">
      <button className="btn-secondary" onClick={ensureAndLoad}>
      Reintentar
      </button>
      <Link href="/dashboard" className="btn-secondary">
      ← Volver
      </Link>
      </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
    <div className="mb-6 flex items-center justify-between">
    <h1 className="text-2xl font-bold" style={{ color: '#1E3A8A' }}>
    Mi Perfil
    </h1>
    <Link href="/dashboard" className="btn-secondary">
    ← Volver
    </Link>
    </div>

    {/* Bloque de solo lectura */}
    <section className="card shadow-soft p-6 grid gap-2">
    <div>
    <span className="text-sm text-slate-500">Nombre</span>
    <div className="text-slate-900 font-medium">{profile.full_name || '-'}</div>
    </div>

    <div>
    <span className="text-sm text-slate-500">Tipo de cuenta</span>
    <div className="text-slate-900 font-medium">{profile.account_type || '-'}</div>
    </div>

    {profile.account_type === 'company' && (
      <div>
      <span className="text-sm text-slate-500">Empresa</span>
      <div className="text-slate-900 font-medium">{profile.company_name || '-'}</div>
      </div>
    )}
    </section>

    {/* Bloque de edición */}
    <div className="mt-8">
    <h2 className="text-xl font-semibold mb-2">Editar perfil</h2>
    <ProfileForm />
    </div>
    </main>
  )
}
