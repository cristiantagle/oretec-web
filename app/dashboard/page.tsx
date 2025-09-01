'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/browser'

type UserInfo = {
    id: string
    email: string | null
    full_name?: string | null
}

export default function DashboardPage() {
    const router = useRouter()
    const supabase = supabaseBrowser()

    const [user, setUser] = useState<UserInfo | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true

        async function prime() {
            const { data } = await supabase.auth.getSession()
            if (!mounted) return

                const session = data.session
                const u = session?.user
                if (!u) {
                    setLoading(false)
                    router.replace('/login') // IMPORTANTE: /login (sin (auth) en la URL)
    return
                }

                setUser({
                    id: u.id,
                    email: u.email,
                    full_name: (u.user_metadata?.full_name as string) || null,
                })
                setLoading(false)
        }

        prime()

        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            const u = session?.user
            if (!u) {
                setUser(null)
                router.replace('/login')
                return
            }
            setUser({
                id: u.id,
                email: u.email,
                full_name: (u.user_metadata?.full_name as string) || null,
            })
        })

        return () => {
            mounted = false
            sub.subscription.unsubscribe()
        }
    }, [router, supabase])

    async function logout() {
        await supabase.auth.signOut()
        router.replace('/login')
    }

    if (loading) {
        return (
            <main className="mx-auto max-w-6xl px-4 py-10">
            <div className="rounded-xl border p-4">Cargando…</div>
            </main>
        )
    }

    return (
        <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: '#1E3A8A' }}>
        Mi Panel
        </h1>
        <div className="flex gap-2">
        <Link href="/" className="btn-secondary">← Volver</Link>
        <button onClick={logout} className="btn-secondary">Cerrar sesión</button>
        </div>
        </div>

        {/* Bienvenida */}
        <section className="card shadow-soft p-6">
        <div className="text-sm text-slate-500">Usuario</div>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">
        {user?.full_name || 'Sin nombre'}
        </h2>
        <div className="mt-1 text-sm">{user?.email}</div>
        </section>

        {/* Próximo: Cursos del alumno */}
        <section className="mt-6 card shadow-soft p-6">
        <div className="text-sm text-slate-500">Mis cursos</div>
        <p className="mt-1 text-slate-700">
        Aquí listaremos tus cursos inscritos, progreso y certificados. (Próximo paso)
        </p>
        </section>
        </main>
    )
}
