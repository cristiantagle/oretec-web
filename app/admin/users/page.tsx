// app/admin/users/page.tsx
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/browser'

type AccountType = 'admin' | 'instructor' | 'company' | 'student'
type UserRow = {
  id: string
  email: string | null
  full_name: string | null
  rut: string | null
  company_name: string | null
  account_type: AccountType | null
  phone: string | null
  created_at: string | null
  updated_at: string | null
}

function accountTypeToEs(at: AccountType | null | undefined): string {
  switch (at) {
    case 'admin': return 'Administrador'
    case 'instructor': return 'Instructor'
    case 'company': return 'Empresa'
    case 'student':
    default: return 'Estudiante'
  }
}

export default function AdminUsersPage() {
  const supabase = useMemo(() => supabaseBrowser(), [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<UserRow[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)

  // Edición local del rol por fila (sin perder el valor si navegas)
  const [pendingRole, setPendingRole] = useState<Record<string, AccountType>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const abortRef = useRef(new AbortController())
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  function setRowPendingRole(userId: string, value: AccountType) {
    setPendingRole(prev => ({ ...prev, [userId]: value }))
  }

  async function fetchUsers(opts?: { page?: number }) {
    const p = opts?.page ?? page
    setLoading(true); setError(null)
    try {
      const { data: sess, error: sessErr } = await supabase.auth.getSession()
      if (sessErr) throw sessErr
        const token = sess.session?.access_token
        if (!token) throw new Error('No autenticado')

          const params = new URLSearchParams({ page: String(p), pageSize: String(pageSize) })
          if (search.trim()) params.set('search', search.trim())

            const r = await fetch(`/api/admin/users/list?${params.toString()}`, {
              headers: { Authorization: `Bearer ${token}` },
              cache: 'no-store',
              signal: abortRef.current.signal,
            })
            const j = await r.json()
            if (!r.ok) throw new Error(j?.error || j?.detail || `status_${r.status}`)

              const items = (j.items as UserRow[]) ?? []
              setRows(items)
              setTotal(j.total as number)
              setPage(j.page as number)

              // Actualiza el buffer pendiente con el rol actual
              setPendingRole(prev => {
                const next: Record<string, AccountType> = { ...prev }
                for (const it of items) {
                  const at = (it.account_type ?? 'student') as AccountType
                  if (!next[it.id]) next[it.id] = at
                }
                return next
              })
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        setError(e?.message || 'No se pudo cargar la lista')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    abortRef.current = new AbortController()
    fetchUsers({ page: 1 })
    return () => abortRef.current.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize])

  async function onSaveRole(userId: string) {
    const nextRole = (pendingRole[userId] ?? 'student') as AccountType
    setSavingId(userId); setError(null)
    try {
      const { data: sess, error: sessErr } = await supabase.auth.getSession()
      if (sessErr) throw sessErr
        const token = sess.session?.access_token
        if (!token) throw new Error('No autenticado')

          const r = await fetch('/api/admin/users/set-role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ user_id: userId, account_type: nextRole }),
          })
          const j = await r.json()
          if (!r.ok) throw new Error(j?.error || j?.detail || 'set_role_error')

            setRows(prev => prev.map(x => x.id === userId
            ? { ...x, account_type: nextRole, updated_at: new Date().toISOString() }
            : x))
    } catch (e: any) {
      setError(e?.message || 'No se pudo guardar el rol')
    } finally {
      setSavingId(null)
    }
  }

  async function onDeleteUser(userId: string) {
    if (!confirm('¿Seguro que quieres eliminar este usuario? Esta acción no se puede deshacer.')) return
      setDeletingId(userId); setError(null)
      try {
        const { data: sess, error: sessErr } = await supabase.auth.getSession()
        if (sessErr) throw sessErr
          const token = sess.session?.access_token
          if (!token) throw new Error('No autenticado')

            const r = await fetch('/api/admin/users/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ user_id: userId }),
            })
            const j = await r.json()
            if (!r.ok) throw new Error(j?.error || j?.detail || 'delete_error')

              setRows(prev => prev.filter(x => x.id !== userId))
              setPendingRole(prev => {
                const { [userId]: _, ...rest } = prev
                return rest
              })
              setTotal(t => Math.max(0, t - 1))
      } catch (e: any) {
        setError(e?.message || 'No se pudo eliminar el usuario')
      } finally {
        setDeletingId(null)
      }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
    <div className="mb-6 flex items-center justify-between">
    <h1 className="text-2xl font-bold" style={{ color: '#1E3A8A' }}>
    Administración de Usuarios
    </h1>
    <div className="flex items-center gap-2">
    <select
    className="rounded border px-2 py-1 text-sm"
    value={pageSize}
    onChange={(e) => setPageSize(Number(e.target.value))}
    >
    <option value={10}>10</option>
    <option value={20}>20</option>
    <option value={50}>50</option>
    </select>
    <button
    className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50"
    onClick={() => fetchUsers()}
    disabled={loading}
    >
    {loading ? 'Actualizando…' : 'Actualizar'}
    </button>
    </div>
    </div>

    <div className="mb-4 flex items-center gap-2">
    <input
    className="w-full max-w-md rounded border px-3 py-2"
    placeholder="Buscar por nombre, RUT, email o empresa…"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    onKeyDown={(e) => { if (e.key === 'Enter') fetchUsers({ page: 1 }) }}
    />
    <button
    className="rounded bg-blue-900 px-4 py-2 text-white hover:bg-blue-800"
    onClick={() => fetchUsers({ page: 1 })}
    >
    Buscar
    </button>
    </div>

    {error && (
      <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {error}
      </div>
    )}

    <div className="overflow-x-auto rounded-xl border">
    <table className="min-w-full text-sm">
    <thead className="bg-slate-50 text-left text-slate-600">
    <tr>
    <th className="px-3 py-2">Nombre</th>
    <th className="px-3 py-2">RUT</th>
    <th className="px-3 py-2">Correo</th>
    <th className="px-3 py-2">Empresa</th>
    <th className="px-3 py-2">Rol</th>
    <th className="px-3 py-2">Teléfono</th>
    <th className="px-3 py-2">Actualizado</th>
    <th className="px-3 py-2">Acciones</th>
    </tr>
    </thead>
    <tbody>
    {rows.map(u => {
      const value = (pendingRole[u.id] ?? u.account_type ?? 'student') as AccountType
      return (
        <tr key={u.id} className="border-t">
        <td className="px-3 py-2">{u.full_name || '—'}</td>
        <td className="px-3 py-2">{u.rut || '—'}</td>
        <td className="px-3 py-2">{u.email || '—'}</td>
        <td className="px-3 py-2">{u.company_name || '—'}</td>
        <td className="px-3 py-2">
        <div className="flex items-center gap-2">
        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-900 ring-1 ring-blue-200">
        {accountTypeToEs(value)}
        </span>
        <select
        className="rounded border px-2 py-1 text-sm"
        value={value}
        onChange={(e) => setRowPendingRole(u.id, e.target.value as AccountType)}
        disabled={savingId === u.id}
        >
        <option value="student">Estudiante</option>
        <option value="company">Empresa</option>
        <option value="instructor">Instructor</option>
        <option value="admin">Administrador</option>
        </select>
        </div>
        </td>
        <td className="px-3 py-2">{u.phone || '—'}</td>
        <td className="px-3 py-2">{u.updated_at ? new Date(u.updated_at).toLocaleString() : '—'}</td>
        <td className="px-3 py-2">
        <div className="flex items-center gap-2">
        <button
        className="rounded bg-blue-900 px-3 py-1 text-white text-xs hover:bg-blue-800 disabled:opacity-50"
        onClick={() => onSaveRole(u.id)}
        disabled={savingId === u.id}
        title="Guardar cambios de rol"
        >
        {savingId === u.id ? 'Guardando…' : 'Guardar'}
        </button>
        <button
        className="rounded border border-red-300 px-3 py-1 text-red-700 text-xs hover:bg-red-50 disabled:opacity-50"
        onClick={() => onDeleteUser(u.id)}
        disabled={deletingId === u.id}
        title="Eliminar usuario"
        >
        {deletingId === u.id ? 'Eliminando…' : 'Borrar'}
        </button>
        </div>
        </td>
        </tr>
      )
    })}
    {rows.length === 0 && !loading && (
      <tr>
      <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
      Sin resultados.
      </td>
      </tr>
    )}
    </tbody>
    </table>
    </div>

    <div className="mt-4 flex items-center justify-between text-sm">
    <div>Total: <strong>{total}</strong></div>
    <div className="flex items-center gap-2">
    <button
    className="rounded border px-3 py-1 disabled:opacity-50"
    onClick={() => fetchUsers({ page: Math.max(1, page - 1) })}
    disabled={page <= 1 || loading}
    >
    Anterior
    </button>
    <span>Página {page} de {totalPages}</span>
    <button
    className="rounded border px-3 py-1 disabled:opacity-50"
    onClick={() => fetchUsers({ page: Math.min(totalPages, page + 1) })}
    disabled={page >= totalPages || loading}
    >
    Siguiente
    </button>
    </div>
    </div>
    </main>
  )
}
