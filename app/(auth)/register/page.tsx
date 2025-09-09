'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabase/browser'

export default function RegisterPage() {
  const supabase = supabaseBrowser()
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setOk(null)
    setLoading(true)
    try {
      // SITE_URL: usa la pública si existe; si no, el origin del navegador
      const site =
      process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.trim().length > 0
      ? process.env.NEXT_PUBLIC_SITE_URL
      : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')

      // quitar una barra final (si la hay) y anexar /dashboard
      const emailRedirectTo = site.replace(/\/$/, '') + '/dashboard'

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName || null },
          emailRedirectTo, // 👈 corregido
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      // Si devuelve sesión al tiro (poco común cuando hay confirmación por correo)
      if (data.session) {
        setOk('Cuenta creada y sesión iniciada.')
        return
      }

      // Caso normal: se envió correo de verificación
      setOk('Te enviamos un correo para confirmar tu cuenta. Revisa tu bandeja.')
    } catch (err: any) {
      setError(err?.message ?? 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
    <h1 className="mb-2 text-2xl font-semibold">Crear cuenta</h1>
    <p className="mb-6 text-sm text-slate-600">
    Regístrate para acceder a tu panel y cursos.
    </p>

    {error && (
      <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {error}
      </div>
    )}
    {ok && (
      <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
      {ok}
      </div>
    )}

    <form onSubmit={onSubmit} className="grid gap-3">
    <label className="grid gap-1">
    <span className="text-sm">Nombre completo</span>
    <input
    type="text"
    className="rounded-md border px-3 py-2"
    value={fullName}
    onChange={(e) => setFullName(e.target.value)}
    placeholder="Ej: Ana Pérez"
    required
    />
    </label>

    <label className="grid gap-1">
    <span className="text-sm">Correo</span>
    <input
    type="email"
    className="rounded-md border px-3 py-2"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="tu@correo.com"
    required
    />
    </label>

    <label className="grid gap-1">
    <span className="text-sm">Contraseña</span>
    <input
    type="password"
    className="rounded-md border px-3 py-2"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="••••••••"
    required
    />
    </label>

    <button
    type="submit"
    disabled={loading}
    className="mt-2 rounded-md bg-blue-700 px-4 py-2 text-white hover:bg-blue-800 disabled:opacity-50"
    >
    {loading ? 'Creando…' : 'Crear cuenta'}
    </button>
    </form>

    <div className="mt-4 text-sm text-slate-600">
    ¿Ya tienes cuenta?{' '}
    <Link href="/login" className="text-blue-700 underline">
    Inicia sesión
    </Link>
    </div>
    </div>
  )
}
