// app/dashboard/page.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabase/browser'
import ProfileEnsure from "@/components/ProfileEnsure";

type AccountType = 'admin' | 'instructor' | 'company' | 'student'

type Profile = {
    id: string
    email: string | null
    full_name: string | null
    account_type: AccountType | null
    company_name: string | null
    phone: string | null
    avatar_url?: string | null
    rut?: string | null
    nationality?: string | null
    profession?: string | null
    address?: string | null
    created_at?: string | null
    updated_at?: string | null
}

export default function DashboardPage() {
    const supabase = supabaseBrowser()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const abortRef = useRef(new AbortController())

    async function loadProfile() {
        setLoading(true); setError(null)
        try {
            const { data: sess, error: sessErr } = await supabase.auth.getSession()
            if (sessErr) throw sessErr
            const token = sess.session?.access_token
            if (!token) throw new Error('No autenticado')

            const r = await fetch('/api/profile/get', {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
                signal: abortRef.current.signal,
            })
            const j = await r.json()
            if (!r.ok) throw new Error(j?.error || j?.detail || `status_${r.status}`)

            setProfile({
                id: j.id,
                email: j.email ?? null,
                full_name: j.full_name ?? null,
                company_name: j.company_name ?? null,
                phone: j.phone ?? null,
                avatar_url: j.avatar_url ?? null,
                account_type: j.account_type ?? 'student',
                rut: j.rut ?? null,
                nationality: j.nationality ?? null,
                profession: j.profession ?? null,
                address: j.address ?? null,
                created_at: j.created_at ?? null,
                updated_at: j.updated_at ?? null,
            })
        } catch (e: any) {
            if (e?.name === 'AbortError') return
            setError(e?.message || 'No se pudo cargar tu perfil')
            setProfile(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        abortRef.current = new AbortController()
        loadProfile()
        return () => abortRef.current.abort()
    }, [])

    const isCompany = profile?.account_type === 'company'

    return (
        <main className="mx-auto max-w-6xl px-4 py-10">
            <header className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold" style={{ color: '#1E3A8A' }}>Panel de Control</h1>
                <button
                    onClick={loadProfile}
                    className="rounded border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
                    disabled={loading}
                >
                    {loading ? 'Actualizando…' : 'Actualizar'}
                </button>
            </header>

            {/* Tarjeta tipo "carnet" */}
            <section className="relative mx-auto w-full max-w-2xl rounded-2xl border bg-gradient-to-br from-blue-50 to-white p-6 shadow-md ring-1 ring-blue-100">
                {/* Encabezado con avatar, nombre y tipo */}
                <div className="flex items-center gap-5">
                    <div className="h-20 w-20 overflow-hidden rounded-xl ring-1 ring-blue-200 bg-blue-100 flex items-center justify-center">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Foto de perfil" className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-3xl">{profile?.full_name?.[0]}</span>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <h2 className="truncate text-2xl font-semibold text-blue-950">
                                {profile?.full_name || '-'}
                            </h2>
                            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-900 ring-1 ring-blue-200">
                                {profile?.account_type ? profile.account_type.toUpperCase() : '-'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Dos columnas alineadas */}
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="grid gap-1 text-sm text-slate-700">
                        <div className="truncate">
                            <span className="text-slate-500">Correo: </span>
                            <span className="font-medium">{profile?.email || '-'}</span>
                        </div>
                        <div className="truncate">
                            <span className="text-slate-500">Empresa: </span>
                            <span className="font-medium">{profile?.company_name || (isCompany ? '-' : '-')}</span>
                        </div>
                        <div className="truncate">
                            <span className="text-slate-500">Teléfono: </span>
                            <span className="font-medium">{profile?.phone || '-'}</span>
                        </div>
                    </div>

                    <div className="grid gap-1 text-sm text-slate-700">
                        <div className="truncate">
                            <span className="text-slate-500">{isCompany ? 'RUT empresa: ' : 'RUT: '}</span>
                            <span className="font-medium">{profile?.rut || '-'}</span>
                        </div>
                        <div className="truncate">
                            <span className="text-slate-500">Nacionalidad: </span>
                            <span className="font-medium">{profile?.nationality || '-'}</span>
                        </div>
                        <div className="truncate">
                            <span className="text-slate-500">Profesión / oficio: </span>
                            <span className="font-medium">{profile?.profession || '-'}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-5 h-[1px] w-full bg-gradient-to-r from-transparent via-blue-200 to-transparent" />

                <div className="mt-3 text-sm text-slate-700">
                    <span className="text-slate-500">Dirección: </span>
                    <span className="font-medium break-words">
                        {profile?.address || '-'}
                    </span>
                </div>

                <div className="mt-3 text-xs text-slate-500">
                    {profile?.updated_at ? `Actualizado: ${new Date(profile.updated_at).toLocaleString()}` : ''}
                </div>
            </section>

            {/* Acciones bajo la tarjeta */}
            <div className="mx-auto mt-5 flex max-w-2xl flex-wrap items-center gap-3">
                <Link
                    href="/dashboard/profile"
                    className="inline-flex items-center rounded-lg bg-blue-900 px-4 py-2 text-white shadow hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                    Editar información
                </Link>

                {/* Agregar participantes solo si es empresa */}
                {isCompany && (
                    <Link
                        href="/dashboard/company/participants"
                        className="inline-flex items-center rounded-lg bg-blue-900 px-4 py-2 text-white shadow hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        Agregar Estudiantes
                    </Link>
                )}
            </div>
        </main>
    )
}
