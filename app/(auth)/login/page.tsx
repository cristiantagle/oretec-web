// app/(auth)/login/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import SectionTitle from '@/components/SectionTitle'
import { supabaseBrowser } from '@/lib/supabase/browser'

export default function LoginPage() {
    const router = useRouter()
    const params = useSearchParams()
    const supabase = supabaseBrowser()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [notice, setNotice] = useState<string | null>(null)

    // Mensaje si vienen de registro/verificación u otros flujos
    useEffect(() => {
        const msg = params.get('m')
        if (msg === 'verified') setNotice('Tu correo fue verificado. Ahora puedes iniciar sesión.')
            if (msg === 'registered') setNotice('Cuenta creada. Revisa tu correo si se solicitó verificación.')
    }, [params])

    // Si ya hay sesión, ir directo al dashboard
    useEffect(() => {
        let mounted = true
        ;(async () => {
            const { data } = await supabase.auth.getSession()
            if (!mounted) return
                if (data.session) router.replace('/dashboard')
        })()
        return () => { mounted = false }
    }, [router, supabase])

    function validate(): string | null {
        const mail = email.trim()
        if (!mail) return 'Ingresa tu correo'
            // validación rápida
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) return 'Correo inválido'
                if (!password) return 'Ingresa tu contraseña'
                    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres'
                        return null
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        const v = validate()
        if (v) { setError(v); return }
        setLoading(true)
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                                                                     password,
            })
            if (error) {
                // Mensajes más claros
                if (error.message?.toLowerCase().includes('invalid login')) {
                    throw new Error('Correo o contraseña incorrectos')
                }
                if (error.message?.toLowerCase().includes('email not confirmed')) {
                    throw new Error('Debes confirmar tu correo antes de ingresar')
                }
                throw error
            }
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

        {notice && (
            <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            {notice}
            </div>
        )}

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
        inputMode="email"
        />
        </label>

        <label className="grid gap-1">
        <span className="text-sm text-slate-600">Contraseña</span>
        <div className="flex items-stretch rounded border overflow-hidden">
        <input
        type={showPw ? 'text' : 'password'}
        className="px-3 py-2 grow outline-none"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
        minLength={6}
        />
        <button
        type="button"
        onClick={() => setShowPw(s => !s)}
        className="px-3 text-sm text-slate-600 hover:bg-slate-50"
        title={showPw ? 'Ocultar' : 'Mostrar'}
        >
        {showPw ? 'Ocultar' : 'Mostrar'}
        </button>
        </div>
        </label>

        <button
        type="submit"
        className="btn-primary mt-2"
        disabled={loading}
        aria-busy={loading}
        >
        {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-600">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="link-anim">
        Regístrate
        </Link>
        </div>

        <div className="mt-2 text-center text-xs text-slate-500">
        ¿Olvidaste tu contraseña? Próximamente podrás recuperarla.
        </div>
        </main>
    )
}
