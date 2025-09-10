// app/(auth)/register/page.tsx
'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import SectionTitle from '@/components/SectionTitle'
import { supabaseBrowser } from '@/lib/supabase/browser'

type AccountType = 'individual' | 'company'

function RegisterInner() {
  const router = useRouter()
  const search = useSearchParams()
  const supabase = supabaseBrowser()

  const initialType = useMemo<AccountType>(() => {
    const t = (search.get('type') || '').toLowerCase()
    return t === 'company' ? 'company' : 'individual'
  }, [search])

  const [type, setType] = useState<AccountType>(initialType)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  // Campos de perfil extra
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')
  const [rut, setRut] = useState('')
  const [nationality, setNationality] = useState('')
  const [profession, setProfession] = useState('')
  const [address, setAddress] = useState('')

  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string>('')

  useEffect(() => {
    setType(initialType)
  }, [initialType])

  function flash(s: string) {
    setMsg(s)
    setTimeout(() => setMsg(''), 3500)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!fullName.trim()) return flash('Ingresa tu nombre completo.')
    if (!email.trim()) return flash('Ingresa tu correo.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return flash('Correo inválido.')
    if (password.length < 6) return flash('La contraseña debe tener al menos 6 caracteres.')
    if (password !== confirm) return flash('Las contraseñas no coinciden.')
    if (type === 'company' && !companyName.trim()) return flash('Ingresa el nombre de la empresa.')

    setLoading(true)
    try {
      const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

      // Enviamos TODOS los datos como user_metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: site.replace(/\/$/, '') + '/dashboard',
          data: {
            full_name: fullName || null,
            account_type: type,
            company_name: type === 'company' ? (companyName || null) : null,
            phone: phone || null,
            rut: rut || null,
            nationality: nationality || null,
            profession: profession || null,
            address: address || null,
          },
        },
      })
      if (error) throw error

      if (data.session?.access_token) {
        try {
          await fetch('/api/profile/ensure', {
            method: 'POST',
            headers: { Authorization: `Bearer ${data.session.access_token}` },
          })
        } catch (_) {}
      }

      flash('Registro exitoso. Revisa tu correo para confirmar la cuenta (si se requiere).')
      setTimeout(() => {
        if (data.session) router.replace('/dashboard')
        else router.replace('/login?m=registered')
      }, 900)
    } catch (e: any) {
      flash(e?.message || 'No se pudo registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <SectionTitle subtitle="Crea tu cuenta para acceder a tus cursos y certificados.">
          Crear cuenta
        </SectionTitle>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType('individual')}
            className={`btn-secondary flex items-center justify-center gap-2 py-2 ${
              type === 'individual' ? 'ring-2 ring-blue-300' : ''
            }`}
          >
            <span className="text-lg">👤</span> Particular
          </button>
          <button
            type="button"
            onClick={() => setType('company')}
            className={`btn-secondary flex items-center justify-center gap-2 py-2 ${
              type === 'company' ? 'ring-2 ring-blue-300' : ''
            }`}
          >
            <span className="text-lg">🏢</span> Empresa
          </button>
        </div>

        {msg && (
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            {msg}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 grid gap-4 rounded-2xl border bg-white p-6 shadow-soft">
          <div className="grid gap-1">
            <label className="text-sm text-slate-700">Nombre completo</label>
            <input
              className="rounded border px-3 py-2"
              placeholder="Ej: Ana Pérez"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
          </div>

          {type === 'company' && (
            <div className="grid gap-1">
              <label className="text-sm text-slate-700">Empresa</label>
              <input
                className="rounded border px-3 py-2"
                placeholder="Ej: OreTec SpA"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                autoComplete="organization"
              />
            </div>
          )}

          <div className="grid gap-1">
            <label className="text-sm text-slate-700">Correo electrónico</label>
            <input
              className="rounded border px-3 py-2"
              type="email"
              placeholder="nombre@correo.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm text-slate-700">Contraseña</label>
            <input
              className="rounded border px-3 py-2"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm text-slate-700">Confirmar contraseña</label>
            <input
              className="rounded border px-3 py-2"
              type="password"
              placeholder="Repite tu contraseña"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm text-slate-700">Teléfono</label>
            <input
              className="rounded border px-3 py-2"
              placeholder="+56 9 1234 5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm text-slate-700">RUT</label>
            <input
              className="rounded border px-3 py-2"
              placeholder="12.345.678-9"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm text-slate-700">Nacionalidad</label>
            <input
              className="rounded border px-3 py-2"
              placeholder="Chilena"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              autoComplete="country-name"
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm text-slate-700">Profesión / oficio</label>
            <input
              className="rounded border px-3 py-2"
              placeholder="Técnico, Ingeniero, etc."
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              autoComplete="organization-title"
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm text-slate-700">Dirección</label>
            <input
              className="rounded border px-3 py-2"
              placeholder="Calle 123, Comuna, Región"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              autoComplete="street-address"
            />
          </div>

          <div className="mt-2 flex items-center justify-between">
            <Link href="/login" className="link-anim text-sm">
              ¿Ya tienes cuenta? Ingresar
            </Link>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creando…' : 'Crear cuenta'}
            </button>
          </div>
        </form>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <div className="mb-1 font-medium text-slate-900">¿Particular o Empresa?</div>
          <p>
            Si eres <span className="font-medium">empresa</span>, podrás gestionar participantes y compras en
            lote. Si eres <span className="font-medium">particular</span>, podrás inscribirte en cursos
            individuales y descargar tus certificados.
          </p>
        </div>
      </div>
    </main>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Cargando…</div>}>
      <RegisterInner />
    </Suspense>
  )
}
