"use client"

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/browser'

type AccountType = 'admin' | 'instructor' | 'company' | 'student'
type Profile = {
  id: string
  full_name: string | null
  company_name: string | null
  account_type: AccountType
  avatar_url?: string | null
  phone?: string | null
  rut?: string | null
  address?: string | null
  birth_date?: string | null
  nationality?: string | null
  profession?: string | null
  updated_at?: string | null
}

const MAX_BYTES = 2 * 1024 * 1024 // 2 MB
const ALLOWED = ['image/jpeg', 'image/png'] as const

export default function ProfileForm() {
  const supabase = supabaseBrowser()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const [userId, setUserId] = useState<string>('')

  // Campos
  const [fullName, setFullName] = useState<string>('')
  const [companyName, setCompanyName] = useState<string>('')
  const [accountType, setAccountType] = useState<AccountType>('student')
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [phone, setPhone] = useState<string>('')

  // nuevos
  const [rut, setRut] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [birthDate, setBirthDate] = useState<string>('') // 'YYYY-MM-DD'
  const [nationality, setNationality] = useState<string>('')
  const [profession, setProfession] = useState<string>('')

  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true); setError(null)
      try {
        const { data: sess, error: sessErr } = await supabase.auth.getSession()
        if (sessErr) throw sessErr
          const token = sess.session?.access_token
          const uid = sess.session?.user?.id
          if (!token || !uid) throw new Error('No autenticado')
            setUserId(uid)

            const res = await fetch('/api/profile/get', {
              headers: { Authorization: `Bearer ${token}` },
              cache: 'no-store',
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json?.error || json?.detail || 'fetch_error')

              if (mounted) {
                const p = json as Partial<Profile>
                setFullName((p.full_name ?? '') as string)
                setCompanyName((p.company_name ?? '') as string)
                const at = String(p.account_type ?? 'student').toLowerCase()
                const normAt: AccountType =
                at === 'admin' || at === 'instructor' || at === 'company' || at === 'student'
                ? (at as AccountType) : 'student'
    setAccountType(normAt)
    setIsAdmin(normAt === 'admin')

    setAvatarUrl((p.avatar_url ?? '') as string)
    setPhone((p.phone ?? '') as string)

    setRut((p.rut ?? '') as string)
    setAddress((p.address ?? '') as string)
    setBirthDate((p.birth_date ?? '') as string)
    setNationality((p.nationality ?? '') as string)
    setProfession((p.profession ?? '') as string)
              }
      } catch (e: any) {
        if (mounted) setError(e?.message || 'No se pudo cargar el perfil')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [supabase])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(null); setOk(null)
    try {
      const { data: sess, error: sessErr } = await supabase.auth.getSession()
      if (sessErr) throw sessErr
        const token = sess.session?.access_token
        if (!token) throw new Error('No autenticado')

          const body: any = {
            full_name: fullName || null,
            company_name: companyName || null,
            avatar_url: avatarUrl || null,
            phone: phone || null,
            rut: rut || null,
            address: address || null,
            birth_date: birthDate || null,
            nationality: nationality || null,
            profession: profession || null,
          }
          // Cualquiera puede cambiar a student/company/instructor, pero no a admin (eso solo admin)
          body.account_type = accountType

          const res = await fetch('/api/profile/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
          })
          const json = await res.json()
          if (!res.ok) throw new Error(json?.error || json?.detail || 'update_error')

            setOk('Guardado ✔')
            window.dispatchEvent(new Event('profile:saved'))
    } catch (e: any) {
      const msg: string = String(e?.message || e)
      if (msg.match(/2 MB|too large|exceeds|File size/i)) {
        setError('El archivo es demasiado grande. Máximo permitido: 2 MB.')
      } else if (msg.match(/mime|type|content[- ]type/i)) {
        setError('Formato no permitido. Solo se admite JPG o PNG.')
      } else if (msg.includes('invalid_birth_date_format')) {
        setError('Fecha de nacimiento inválida. Usa formato AAAA-MM-DD.')
      } else {
        setError(msg)
      }
    } finally {
      setSaving(false)
    }
  }

  async function onPickAvatar(file: File | null) {
    if (!file || !userId) return
      setUploading(true); setError(null); setOk(null)
      try {
        if (!ALLOWED.includes(file.type as any)) {
          throw new Error('Formato no permitido. Solo JPG o PNG.')
        }
        if (file.size > MAX_BYTES) {
          throw new Error('El archivo es demasiado grande. Máximo 2 MB.')
        }

        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
        const path = `${userId}.${ext}`

        const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })
        if (upErr) throw upErr

          const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path)
          const publicUrl = pub?.publicUrl
          if (!publicUrl) throw new Error('No se pudo obtener URL pública del avatar')

            const { data: sess, error: sessErr } = await supabase.auth.getSession()
            if (sessErr) throw sessErr
              const token = sess.session?.access_token
              if (!token) throw new Error('No autenticado')

                const res = await fetch('/api/profile/update', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ avatar_url: publicUrl }),
                })
                const json = await res.json()
                if (!res.ok) throw new Error(json?.detail || json?.error || 'update_error')

                  setAvatarUrl(publicUrl)
                  setOk('Foto actualizada ✔')
                  window.dispatchEvent(new Event('profile:saved'))
      } catch (e: any) {
        const msg: string = String(e?.message || e)
        if (msg.includes('2 MB')) setError('El archivo es demasiado grande. Máximo 2 MB.')
          else if (msg.toLowerCase().includes('formato')) setError('Formato no permitido. Solo JPG o PNG.')
            else setError(msg)
      } finally {
        setUploading(false)
      }
  }

  if (loading) return <div className="p-4">Cargando…</div>
    if (error) return <div className="p-4 text-red-600">Error: {error}</div>

      return (
        <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
        {/* Avatar + upload */}
        <div>
        <label className="block text-sm font-medium mb-1">Foto tipo carnet</label>
        <p className="mb-2 text-xs text-slate-500">
        Solo <strong>JPG</strong> o <strong>PNG</strong>. Tamaño máximo: <strong>2 MB</strong>.
        </p>
        <div className="flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-lg ring-1 ring-blue-200 bg-blue-100 flex items-center justify-center">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <div className="text-blue-900/80 text-xs text-center px-1">Sin foto</div>
        )}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
        <input
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => onPickAvatar(e.target.files?.[0] ?? null)}
        disabled={uploading}
        />
        {uploading ? 'Subiendo…' : 'Subir foto'}
        </label>
        </div>
        </div>

        {/* Datos básicos */}
        <div className="grid gap-4 md:grid-cols-2">
        <div>
        <label className="block text-sm font-medium">Nombre completo</label>
        <input
        className="mt-1 w-full rounded border p-2"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Tu nombre"
        />
        </div>

        <div>
        <label className="block text-sm font-medium">Empresa</label>
        <input
        className="mt-1 w-full rounded border p-2"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        placeholder="Nombre de tu empresa"
        />
        </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
        <div>
        <label className="block text-sm font-medium">Teléfono</label>
        <input
        className="mt-1 w-full rounded border p-2"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+56 9 …"
        />
        </div>

        {/* Tipo de cuenta: visible para todos; "Administrador" deshabilitado si no eres admin */}
        <div>
        <label className="block text-sm font-medium">Tipo de cuenta</label>
        <select
        className="mt-1 w-full rounded border p-2"
        value={accountType}
        onChange={(e) => {
          const v = e.target.value as AccountType
          // Si no es admin, impedir elegir "admin"
          if (!isAdmin && v === 'admin') return
            setAccountType(v)
        }}
        >
        <option value="student">Estudiante</option>
        <option value="company">Empresa</option>
        <option value="instructor">Instructor</option>
        <option value="admin" disabled={!isAdmin}>Administrador</option>
        </select>
        {!isAdmin && (
          <p className="mt-1 text-xs text-slate-500">
          Solo un administrador puede asignar el rol "Administrador".
          </p>
        )}
        </div>
        </div>

        {/* Nuevos campos */}
        <div className="grid gap-4 md:grid-cols-2">
        <div>
        <label className="block text-sm font-medium">RUT</label>
        <input
        className="mt-1 w-full rounded border p-2"
        value={rut}
        onChange={(e) => setRut(e.target.value)}
        placeholder="12.345.678-9"
        />
        </div>
        <div>
        <label className="block text-sm font-medium">Nacionalidad</label>
        <input
        className="mt-1 w-full rounded border p-2"
        value={nationality}
        onChange={(e) => setNationality(e.target.value)}
        placeholder="Chilena"
        />
        </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
        <div>
        <label className="block text-sm font-medium">Fecha de nacimiento</label>
        <input
        type="date"
        className="mt-1 w-full rounded border p-2"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
        />
        </div>
        <div>
        <label className="block text-sm font-medium">Profesión / oficio</label>
        <input
        className="mt-1 w-full rounded border p-2"
        value={profession}
        onChange={(e) => setProfession(e.target.value)}
        placeholder="Técnico Eléctrico"
        />
        </div>
        </div>

        <div>
        <label className="block text-sm font-medium">Dirección</label>
        <input
        className="mt-1 w-full rounded border p-2"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Calle #123, Comuna, Ciudad"
        />
        </div>

        <div className="flex items-center gap-3">
        <button
        disabled={saving}
        className="rounded bg-blue-900 px-4 py-2 text-white disabled:opacity-50 hover:bg-blue-800"
        >
        {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
        {ok && <span className="text-green-600">{ok}</span>}
        {error && <span className="text-red-600">Error: {error}</span>}
        </div>
        </form>
      )
}
