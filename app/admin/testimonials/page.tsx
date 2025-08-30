'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type T = {
  id: string
  name: string
  role: string | null
  quote: string
  initials: string | null
  published: boolean
  created_at?: string
}

export default function AdminTestimonialsPage() {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<string>('')

  const [draft, setDraft] = useState<Record<string, Partial<T>>>({})
  const changedIds = useMemo(() => new Set(Object.keys(draft)), [draft])

  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    name: '',
    role: '',
    quote: '',
    initials: '',
    published: true,
  })

  async function load() {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/testimonials/list', { cache: 'no-store' })
      const data = await r.json()
      setRows(Array.isArray(data) ? data : [])
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function setField(id: string, key: keyof T, value: any) {
    setDraft((d) => ({ ...d, [id]: { ...(d[id] || {}), [key]: value } }))
  }

  async function save(id: string) {
    try {
      const r = await fetch('/api/admin/testimonials/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...draft[id] }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error || 'No se pudo actualizar')
        const updated: T = data.testimonial
        setRows((rs) => rs.map((x) => (x.id === id ? updated : x)))
        setDraft(({ [id]: _, ...rest }) => rest)
        flash('Testimonio actualizado')
    } catch (e: any) {
      flash('Error: ' + (e.message || e))
    }
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar testimonio?')) return
      try {
        const r = await fetch('/api/admin/testimonials/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        })
        const data = await r.json()
        if (!r.ok) throw new Error(data?.error || 'No se pudo eliminar')
          setRows((rs) => rs.filter((x) => x.id !== id))
          flash('Eliminado')
      } catch (e: any) {
        flash('Error: ' + (e.message || e))
      }
  }

  async function create(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.quote) {
      flash('Completa nombre y cita')
      return
    }
    setCreating(true)
    try {
      const r = await fetch('/api/admin/testimonials/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          role: form.role || null,
          quote: form.quote,
          initials: form.initials || null,
          published: form.published,
        }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error || 'No se pudo crear')
        setRows((rs) => [data.testimonial, ...rs])
        setForm({ name: '', role: '', quote: '', initials: '', published: true })
        flash('Creado')
    } catch (e: any) {
      flash('Error: ' + (e.message || e))
    } finally {
      setCreating(false)
    }
  }

  function flash(text: string) {
    setMsg(text)
    setTimeout(() => setMsg(''), 2500)
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
    <div className="mb-6 flex items-center justify-between">
    <h1 className="text-2xl font-bold" style={{ color: '#1E3A8A' }}>
    Admin — Testimonios
    </h1>
    <div className="flex gap-2">
    <Link href="/admin" className="btn-secondary">
    ← Volver
    </Link>
    <Link href="/" className="btn-secondary">
    Ir al sitio
    </Link>
    </div>
    </div>

    {msg && (
      <div className="mb-4 rounded-xl border p-3 text-sm bg-blue-50 text-blue-700">{msg}</div>
    )}

    {/* Crear */}
    <form onSubmit={create} className="mb-6 grid gap-3 rounded-2xl border bg-white p-4">
    <div className="font-medium text-slate-900">Nuevo testimonio</div>
    <div className="grid gap-3 md:grid-cols-2">
    <input
    className="rounded border px-2 py-1"
    placeholder="Nombre *"
    value={form.name}
    onChange={(e) => setForm({ ...form, name: e.target.value })}
    />
    <input
    className="rounded border px-2 py-1"
    placeholder="Cargo/Rol"
    value={form.role}
    onChange={(e) => setForm({ ...form, role: e.target.value })}
    />
    <input
    className="rounded border px-2 py-1"
    placeholder="Iniciales (ej: MP)"
    value={form.initials}
    onChange={(e) => setForm({ ...form, initials: e.target.value })}
    />
    <label className="flex items-center gap-2 text-sm text-slate-700">
    <input
    type="checkbox"
    checked={form.published}
    onChange={(e) => setForm({ ...form, published: e.target.checked })}
    />
    Publicado
    </label>
    </div>
    <textarea
    className="rounded border px-2 py-1"
    rows={3}
    placeholder="Cita / comentario *"
    value={form.quote}
    onChange={(e) => setForm({ ...form, quote: e.target.value })}
    />
    <div className="flex justify-end">
    <button type="submit" disabled={creating} className="btn-primary">
    {creating ? 'Creando…' : 'Crear'}
    </button>
    </div>
    </form>

    {/* Lista / edición rápida */}
    {loading ? (
      <div className="rounded-xl border p-4">Cargando…</div>
    ) : (
      <div className="overflow-x-auto rounded-2xl border bg-white">
      <table className="min-w-full text-sm">
      <thead className="bg-gray-50">
      <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
      <th>Nombre</th>
      <th>Rol</th>
      <th>Cita</th>
      <th>Iniciales</th>
      <th>Publicado</th>
      <th>Guardar</th>
      <th>Acciones</th>
      </tr>
      </thead>
      <tbody className="[&>tr>*]:px-3 [&>tr>*]:py-2">
      {rows.map((r) => {
        const d = draft[r.id] || {}
        return (
          <tr key={r.id} className="align-top border-t">
          <td>
          <input
          className="w-48 rounded border px-2 py-1"
          defaultValue={r.name}
          onChange={(e) => setField(r.id, 'name', e.target.value)}
          />
          </td>
          <td>
          <input
          className="w-40 rounded border px-2 py-1"
          defaultValue={r.role ?? ''}
          onChange={(e) => setField(r.id, 'role', e.target.value)}
          />
          </td>
          <td>
          <textarea
          className="w-96 rounded border px-2 py-1"
          rows={2}
          defaultValue={r.quote}
          onChange={(e) => setField(r.id, 'quote', e.target.value)}
          />
          </td>
          <td>
          <input
          className="w-16 rounded border px-2 py-1"
          defaultValue={r.initials ?? ''}
          onChange={(e) => setField(r.id, 'initials', e.target.value)}
          />
          </td>
          <td className="text-center">
          <input
          type="checkbox"
          defaultChecked={r.published}
          onChange={(e) => setField(r.id, 'published', e.target.checked)}
          />
          </td>
          <td className="whitespace-nowrap">
          <button
          disabled={!changedIds.has(r.id)}
          onClick={() => save(r.id)}
          className={`btn-primary ${
            !changedIds.has(r.id) ? 'pointer-events-none opacity-40' : ''
          }`}
          >
          Guardar
          </button>
          </td>
          <td className="whitespace-nowrap">
          <button onClick={() => remove(r.id)} className="btn-danger">
          Eliminar
          </button>
          </td>
          </tr>
        )
      })}
      {!rows.length && (
        <tr>
        <td colSpan={7} className="py-8 text-center text-gray-500">
        Sin testimonios.
        </td>
        </tr>
      )}
      </tbody>
      </table>
      </div>
    )}
    </main>
  )
}
