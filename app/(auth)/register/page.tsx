'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import SectionTitle from '@/components/SectionTitle'
import { supabaseBrowser } from '@/lib/supabase/browser'

export default function RegisterPage() {
    const router = useRouter()
    const supabase = supabaseBrowser()

    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [info, setInfo] = useState<string | null>(null)

    // Si ya hay sesión, enviar a dashboard
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
        setInfo(null)
        setLoading(true)
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName },
                    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
                },
            })
            if (error) throw error

                // Si el proyecto requiere confirmación por email, no habrá session aquí
                if (data.session) {
                    router.replace('/dashboard')
                } else {
                    setInfo('Te enviamos un correo para confirmar tu cuenta. Revisa tu bandeja y sigue el enlace.')
                }
        } catch (e: any) {
            setError(e?.message ?? 'No se pudo crear la cuenta')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="mx-auto max-w-md px-4 py-10">
        <SectionTitle subtitle="Crea tu cuenta para inscribirte y llevar tu progreso.">
        Registrarse
        </SectionTitle>

        {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
            </div>
        )}
        {info && (
            <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            {info}
            </div>
        )}

        <form onSubmit={onSubmit} className="card shadow-soft p-5 grid gap-3">
        <label className="grid gap-1">
        <span className="text-sm text-slate-600">Nombre completo</span>
        <input
        className="rounded border px-3 py-2"
        placeholder="Tu nombre"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
        autoComplete="name"
        />
        </label>

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
        placeholder="Mínimo 6 caracteres"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="new-password"
        minLength={6}
        />
        </label>

        <button type="submit" className="btn-primary mt-2" disabled={loading}>
        {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-600">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="link-anim">
        Inicia sesión
        </Link>
        </div>
        </main>
    )
}
