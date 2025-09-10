// app/admin/users/page.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabase/browser'

type UserRow = {
  id: string
  email: string | null
  full_name: string | null
  rut: string | null
  company_name: string | null
  account_type: 'admin' | 'instructor' | 'company' | 'student' | null
  phone: string | null
  created_at?: string | null
  updated_at?: string | null
}

type ListResp = {
  ok?: boolean
  error?: string
  items?: UserRow[]
  total?: number
  page?: number
  pageSize?: number
}

const ROLE_OPTIONS = ['admin', 'instructor', 'company', 'student'] as const
type Role = typeof ROLE_OPTIONS[number]

export default function AdminUsersPage() {
  const supabase = supabaseBrowser()
  const abortRef = useRef(new AbortController())

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [rows, setRows] = useState<UserRow[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState('')

  function flash(s: string) {
    setNotice(s)
    setTimeout(() => setNotice(null), 2500)
  }

  async function fetchRows(p = page) {
    setLoading(true)
    setError(null)
    try {
      const { data } = await supabase.auth.getSession()
      const token = data?.session?.access_token || ''

      const params = new URLSearchParams({ page: String(p), pageSize: String(pageSize) })
      if (search.trim()) params.set('search', search.trim())

      const r = await fetch(`/api/admin/users/list?${params.toString()}`, {
        credentials: 'include', // importante para cookie admin_auth
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: 'no-store',
        signal: abortRef.current.signal,
      })

      if (!r.ok) {
        let msg = `Error ${r.status}`
        try {
          const j = (await r.json()) as any
          if (j?.error) msg = j.error
        } catch {}
        setRows([])
        setError(msg)
        return
      }

      const j = (await r.json()) as ListResp
      const items = Array.isArray(j.items) ? j.items : []
      setRows(items)
    } catch (e: any) {
      if (e?.name === 'AbortError') return
      setError(e?.message || 'Fallo al cargar usuarios')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    abortRef.current = new AbortController()
    fetchRows(1)
    return () => abortRef.current.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, search])

  function fmtDate(s?: string | null) {
    if (!s) return '-'
    try {
      return new Date(s).toLocaleString()
    } catch {
      return s
    }
  }

  async function handleRoleChange(userId: string, nextRole: Role) {
    // optimista
    const prev = rows
    setRows((curr) => curr.map(r => r.id === userId ? { ...r, account_type: nextRole } : r))

    try {
      const r = await fetch('/api/admin/users/set-role', {
        method: 'POST',
        credentials: 'include', // cookie superadmin
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: nextRole }),
      })
      if (!r.ok) {
        let msg = `Error ${r.status}`
        try { const j = await r.json(); if (j?.error) msg = j.error } catch {}
        flash(msg)
        // revertir optimismo
        setRows(prev)
        return
      }
      flash('Rol actualizado')
    } catch (e: any) {
      flash(e?.message || 'No se pudo actualizar rol')
      setRows(prev)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: '#1E3A8A' }}>
          Administración de Usuarios
        </h1>
        <Link href="/admin" className="btn-secondary">← Volver</Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          className="rounded border px-2 py-1"
          value={pageSize}
          onChange={(e) => setPageSize(parseInt(e.target.value, 10) || 20)}
        >
          {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <button className="btn-secondary" onClick={() => fetchRows(1)}>Actualizar</button>
        <div className="grow"></div>
        <input
          className="rounded border px-3 py-2 w-72"
          placeholder="Buscar por nombre, RUT, email o empresa…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-secondary" onClick={() => fetchRows(1)}>Buscar</button>
      </div>

      {notice && (
        <div className="mb-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
          {notice}
        </div>
      )}
      {error && (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">RUT</th>
              <th className="px-3 py-2">Correo</th>
              <th className="px-3 py-2">Empresa</th>
              <th className="px-3 py-2">Rol</th>
              <th className="px-3 py-2">Teléfono</th>
              <th className="px-3 py-2">Actualizado</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading && (
              <tr>
                <td className="px-3 py-4 text-center text-slate-500" colSpan={7}>
                  Sin resultados.
                </td>
              </tr>
            )}
            {rows.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-3 py-2">{u.full_name || '-'}</td>
                <td className="px-3 py-2">{u.rut || '-'}</td>
                <td className="px-3 py-2">{u.email || '-'}</td>
                <td className="px-3 py-2">{u.company_name || '-'}</td>
                <td className="px-3 py-2">
                  <select
                    className="rounded border px-2 py-1"
                    value={u.account_type || 'student'}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                  >
                    {ROLE_OPTIONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">{u.phone || '-'}</td>
                <td className="px-3 py-2">{fmtDate(u.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
