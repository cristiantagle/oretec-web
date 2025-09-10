// app/admin/users/page.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/browser'

type Role = 'student' | 'instructor' | 'company' | 'admin'

type UserRow = {
  id: string
  email: string | null
  full_name: string | null
  rut: string | null
  company_name: string | null
  account_type: Role | null
  phone: string | null
  created_at?: string | null
  updated_at?: string | null
}

const ROLE_LABEL: Record<Role, string> = {
  student: 'Estudiante',
  instructor: 'Relator',
  company: 'Empresa',
  admin: 'Administrador',
}

export default function AdminUsersPage() {
  const router = useRouter()
  const supabase = supabaseBrowser()
  const abortRef = useRef(new AbortController())

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [items, setItems] = useState<UserRow[]>([])
  const [total, setTotal] = useState(0)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState('')

  async function fetchList(p = page) {
    setLoading(true)
    setError(null)
    try {
      const { data: ses } = await supabase.auth.getSession()
      const token = ses?.session?.access_token ?? ''

      const params = new URLSearchParams({
        page: String(p),
        pageSize: String(pageSize),
      })
      if (search.trim()) params.set('search', search.trim())

      // Defensa doble: cookie admin_auth y, si existe, bearer
      const r = await fetch(`/api/admin/users/list?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
        signal: abortRef.current.signal,
      })

      if (!r.ok) {
        // Manejo de errores legibles
        let msg = `${r.status}`
        try {
          const j = await r.json()
          if (j?.error) msg = j.error
        } catch {}
        if (r.status === 401) {
          setError('No autenticado')
        } else if (r.status === 403) {
          setError('Acceso denegado (se requiere admin)')
        } else {
          setError(msg || 'Error inesperado')
        }
        setItems([])
        setTotal(0)
        return
      }

      const j = await r.json()
      setItems(Array.isArray(j?.items) ? j.items : [])
      setTotal(Number.isFinite(j?.total) ? j.total : 0)
    } catch (e: any) {
      if (e?.name !== 'AbortError') setError(e?.message || 'Error al cargar usuarios')
      setItems([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  // Cambia rol y actualiza la fila en caliente
  async function onChangeRole(userId: string, nextRole: Role) {
    try {
      const { data: ses } = await supabase.auth.getSession()
      const token = ses?.session?.access_token ?? ''

      const r = await fetch('/api/admin/users/set-role', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId, role: nextRole }),
      })
      if (!r.ok) {
        let msg = `${r.status}`
        try {
          const j = await r.json()
          if (j?.error) msg = j.error
        } catch {}
        if (r.status === 401) throw new Error('No autenticado')
        if (r.status === 403) throw new Error('Acceso denegado')
        throw new Error(msg || 'Error al guardar')
      }
      // Actualizar en memoria sin recargar toda la tabla
      setItems(prev =>
        prev.map(u => (u.id === userId ? { ...u, account_type: nextRole } : u))
      )
    } catch (e: any) {
      alert(e?.message || 'No se pudo cambiar el rol')
    }
  }

  function labelFor(role: Role | null): string {
    if (!role) return 'Estudiante'
    return ROLE_LABEL[role] ?? 'Estudiante'
  }

  useEffect(() => {
    abortRef.current = new AbortController()
    fetchList(1)
    return () => abortRef.current.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, search])

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4" style={{ color: '#1E3A8A' }}>
        Administración de Usuarios
      </h1>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          className="rounded border px-2 py-1"
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value) || 20)}
        >
          {[10, 20, 50, 100].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <button
          className="btn-secondary"
          onClick={() => fetchList(page)}
          disabled={loading}
        >
          {loading ? 'Cargando…' : 'Actualizar'}
        </button>
        <div className="grow" />
        <input
          className="rounded border px-3 py-2 w-64"
          placeholder="Buscar por nombre, RUT, email o empresa…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-primary" onClick={() => fetchList(1)} disabled={loading}>
          Buscar
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left">
              <th className="p-2">Nombre</th>
              <th className="p-2">RUT</th>
              <th className="p-2">Correo</th>
              <th className="p-2">Empresa</th>
              <th className="p-2">Rol</th>
              <th className="p-2">Teléfono</th>
              <th className="p-2">Actualizado</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td className="p-3 text-center text-slate-500" colSpan={8}>
                  {loading ? 'Cargando…' : 'Sin resultados.'}
                </td>
              </tr>
            )}

            {items.map(u => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.full_name || '—'}</td>
                <td className="p-2">{u.rut || '—'}</td>
                <td className="p-2">{u.email || '—'}</td>
                <td className="p-2">{u.company_name || '—'}</td>
                <td className="p-2">
                  <select
                    className="rounded border px-2 py-1"
                    value={(u.account_type ?? 'student') as Role}
                    onChange={(e) => onChangeRole(u.id, e.target.value as Role)}
                  >
                    <option value="student">{ROLE_LABEL.student}</option>
                    <option value="instructor">{ROLE_LABEL.instructor}</option>
                    <option value="company">{ROLE_LABEL.company}</option>
                    <option value="admin">{ROLE_LABEL.admin}</option>
                  </select>
                </td>
                <td className="p-2">{u.phone || '—'}</td>
                <td className="p-2">
                  {u.updated_at ? new Date(u.updated_at).toLocaleString() : '—'}
                </td>
                <td className="p-2">
                  {/* Acciones futuras (ver, editar, borrar, etc.) */}
                  <span className="text-slate-400">—</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-sm text-slate-600">Total: {total}</div>
    </main>
  )
}
