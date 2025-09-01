'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import SectionTitle from '@/components/SectionTitle'
import { supabaseBrowser } from '@/lib/supabase/browser'

export default function LoginPage() {
    const router = useRouter()
    const supabase = supabaseBrowser()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Si ya hay sesión, ir directo al dashboard
    useEffect(() => {
        let mounted = true
        ;(async () => {
            const { data } = await supabase.auth.getSession()
            if (!mounted) return
                if (data.session) {
                    router.replace('/dashboard')
                }
        })()
        return () => { mounted = false }
    }, [router, supabase])

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) throw error
                router.replace('/dashboard')
        } catch (e: any) {
            setError(e?.message ?? 'No se pudo iniciar sesión')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="mx-auto max-w-md px-4 py-10">
        <SectionTitle subtitle="Accede para ver tus cursos y tu progreso.">
        Iniciar sesión
        </SectionTitle>

        {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
            </div>
        )}

        <form onSubmit={onSubmit} className="card shadow-soft p-5 grid gap-3">
        <label className="grid gap-1">
        <span className="text-sm text-slate-600">Correo</span>
        <input
        type="email"
        className="rounded border px-3 py-2"
        placeholder="tucorreo@dominio.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
        />
        </label>

        <label className="grid gap-1">
        <span className="text-sm text-slate-600">Contraseña</span>
        <input
        type="password"
        className="rounded border px-3 py-2"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
        />
        </label>

        <button type="submit" className="btn-primary mt-2" disabled={loading}>
        {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-600">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="link-anim">
        Regístrate
        </Link>
        </div>
        </main>
    )
}
