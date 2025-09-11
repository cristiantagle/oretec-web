#!/bin/bash
set -e

BRANCH="fix/admin-role-dropdown-$(date +%Y%m%d-%H%M%S)"

echo "🪄 Creando rama $BRANCH…"
git stash push -m "auto-stash-before-$BRANCH" --include-untracked || true
git checkout main
git pull origin main
git checkout -b "$BRANCH"

cat > app/admin/users/page.tsx <<'TS'
// app/admin/users/page.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/browser'

type Role = 'admin' | 'instructor' | 'company' | 'student'

type Row = {
  id: string
  email: string | null
  full_name: string | null
  company_name: string | null
  account_type: Role | null
  phone: string | null
  rut: string | null
  address: string | null
  nationality: string | null
  profession: string | null
  updated_at: string | null
}

const ROLE_LABEL: Record<Role, string> = {
  admin: 'Administrador',
  instructor: 'Relator',
  company: 'Empresa',
  student: 'Estudiante',
}

export default function AdminUsersPage() {
  const router = useRouter()
  const params = useSearchParams()
  const supabase = supabaseBrowser()

  const [page, setPage] = useState<number>(parseInt(params.get('page') || '1', 10) || 1)
  const [pageSize, setPageSize] = useState<number>(parseInt(params.get('pageSize') || '20', 10) || 20)
  const [search, setSearch] = useState<string>(params.get('search') || '')
  const [rows, setRows] = useState<Row[]>([])
  const [total, setTotal] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const abortRef = useRef(new AbortController())

  async function getBearer(): Promise<string | null> {
    try {
      const { data } = await supabase.auth.getSession()
      return data?.session?.access_token ?? null
    } catch {
      return null
    }
  }

  async function fetchList(p = page) {
    setLoading(true)
    setError('')
    abortRef.current = new AbortController()
    try {
      const token = await getBearer()

      const qs = new URLSearchParams({
        page: String(p),
                                     pageSize: String(pageSize)
      })
      if (search.trim()) qs.set('search', search.trim())

        const r = await fetch(`/api/admin/users/list?${qs.toString()}`, {
          method: 'GET',
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: 'no-store',
          signal: abortRef.current.signal
        })

        const text = await r.text()
        let j: any = {}
        try { j = text ? JSON.parse(text) : {} } catch { /* ignore */ }

        if (!r.ok) {
          setRows([])
          setTotal(0)
          const msg = j?.error ? `${j.error}${j.detail ? ' - ' + j.detail : ''}` : `HTTP ${r.status}`
          setError(msg || 'Error')
          return
        }

        setRows(Array.isArray(j.items) ? j.items : [])
        setTotal(typeof j.total === 'number' ? j.total : 0)
    } catch (e: any) {
      if (e?.name !== 'AbortError') setError(e?.message || 'Error de red')
    } finally {
      setLoading(false)
    }
  }

  async function changeRole(id: string, role: Role): Promise<boolean> {
    setError('')
    try {
      const token = await getBearer()
      const r = await fetch('/api/admin/users/set-role', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id, role }),
      })

      const text = await r.text()
      let j: any = {}
      try { j = text ? JSON.parse(text) : {} } catch { /* ignore */ }

      if (!r.ok) {
        const msg = j?.error ? `${j.error}${j.detail ? ' - ' + j.detail : ''}` : `HTTP ${r.status}`
        setError(msg || 'Error')
        return false
      }

      return true
    } catch (e: any) {
      setError(e?.message || 'Error de red')
      return false
    }
  }

  async function handleRoleChange(rowIndex: number, newRole: Role) {
    const prev = rows[rowIndex]
    if (!prev) return

      const before = rows
      const updated = [...rows]
      updated[rowIndex] = { ...updated[rowIndex], account_type: newRole }
      setRows(updated)

      const ok = await changeRole(prev.id, newRole)
      if (!ok) {
        setRows(before)
        return
      }

      fetchList(page)
  }

  useEffect(() => {
    fetchList(1)
  }, [pageSize, search])

  useEffect(() => {
    return () => abortRef.current.abort()
  }, [])

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
    <div className="mb-4 flex items-center justify-between">
    <h1 className="text-2xl font-bold" style={{ color: '#1E3A8A' }}>Administración de Usuarios</h1>
    <Link href="/dashboard" className="btn-secondary">← Volver</Link>
    </div>

    <div className="mb-4 flex items-center gap-2">
    <select
    className="rounded border px-2 py-1"
    value={pageSize}
    onChange={e => setPageSize(parseInt(e.target.value, 10))}
    >
    {[10,20,50,100].map(n => <option key={n} value={n}>{n}</option>)}
    </select>
    <button className="btn-secondary" onClick={() => fetchList(page)} disabled={loading}>
    {loading ? 'Actualizando…' : 'Actualizar'}
    </button>
    <div className="ml-auto flex items-center gap-2">
    <input
    className="rounded border px-3 py-2"
    placeholder="Buscar por nombre, RUT, email o empresa…"
    value={search}
    onChange={e => setSearch(e.target.value)}
    />
    <button className="btn-secondary" onClick={() => fetchList(1)}>Buscar</button>
    </div>
    </div>

    {error && (
      <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {error}
      </div>
    )}

    <div className="overflow-auto">
    <table className="w-full text-sm">
    <thead>
    <tr className="text-left border-b">
    <th className="py-2 pr-4">Nombre</th>
    <th className="py-2 pr-4">RUT</th>
    <th className="py-2 pr-4">Correo</th>
    <th className="py-2 pr-4">Empresa</th>
    <th className="py-2 pr-4">Rol</th>
    <th className="py-2 pr-4">Teléfono</th>
    <th className="py-2 pr-4">Actualizado</th>
    <th className="py-2 pr-4">Acciones</th>
    </tr>
    </thead>
    <tbody>
    {rows.length === 0 && (
      <tr>
      <td colSpan={8} className="py-8 text-center text-slate-500">
      {loading ? 'Cargando…' : 'Sin resultados.'}
      </td>
      </tr>
    )}
    {rows.map((r, idx) => {
      const currentRole: Role = (r.account_type as Role) || 'student'
    return (
      <tr key={r.id} className="border-b">
      <td className="py-2 pr-4">{r.full_name || '-'}</td>
      <td className="py-2 pr-4">{r.rut || '-'}</td>
      <td className="py-2 pr-4">{r.email || '-'}</td>
      <td className="py-2 pr-4">{r.company_name || '-'}</td>
      <td className="py-2 pr-4">
      <select
      className="rounded border px-2 py-1"
      value={currentRole}
      onChange={(e) => handleRoleChange(idx, e.target.value as Role)}
      >
      {(['student','instructor','company','admin'] as Role[]).map(role => (
        <option key={role} value={role}>{ROLE_LABEL[role]}</option>
      ))}
      </select>
      </td>
      <td className="py-2 pr-4">{r.phone || '-'}</td>
      <td className="py-2 pr-4">{r.updated_at ? new Date(r.updated_at).toLocaleString() : '-'}</td>
      <td className="py-2 pr-4">
      <div className="text-slate-400">—</div>
      </td>
      </tr>
    )
    })}
    </tbody>
    </table>
    </div>

    <div className="mt-4 flex items-center gap-2">
    <button
    className="btn-secondary"
    onClick={() => { const np = Math.max(1, page - 1); setPage(np); fetchList(np) }}
    disabled={page <= 1 || loading}
    >
    ← Anterior
    </button>
    <div className="px-2">Página {page}</div>
    <button
    className="btn-secondary"
    onClick={() => { const np = page + 1; if ((page * pageSize) < total) { setPage(np); fetchList(np) } }}
    disabled={(page * pageSize) >= total || loading}
    >
    Siguiente →
    </button>
    <div className="ml-auto text-slate-600">Total: {total}</div>
    </div>
    </main>
  )
}
TS

git add app/admin/users/page.tsx
git commit -m "feat(admin): dropdown para cambiar rol con actualización instantánea"
git push origin "$BRANCH"

echo "✅ Listo. Revisa el deploy en Vercel para la rama: $BRANCH"
