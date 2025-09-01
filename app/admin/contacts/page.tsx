'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type Row = {
  id: string
  created_at: string
  name: string
  email: string
  phone: string | null
  company: string | null
  message: string
  status: 'new' | 'in_progress' | 'done'
  archived: boolean
  admin_notes: string | null
}

export default function AdminContactsPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all'|'new'|'in_progress'|'done'|'archived'>('all')

  // sólo guardaremos cambios de status/archived desde la lista
  const [draft, setDraft] = useState<Record<string, Partial<Pick<Row,'status'|'archived'>>>>({})
  const changedIds = useMemo(() => new Set(Object.keys(draft)), [draft])
  const [msg, setMsg] = useState('')

  async function load() {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/contacts/list', { cache: 'no-store' })
      const data = await r.json()
      const arr: Row[] = Array.isArray(data) ? data : []
      setRows(arr)
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  function setField(id: string, key: 'status'|'archived', value: any) {
    setDraft((d) => ({ ...d, [id]: { ...(d[id]||{}), [key]: value } }))
  }

  async function save(id: string) {
    try {
      const r = await fetch('/api/admin/contacts/update', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ id, ...draft[id] })
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error || 'No se pudo actualizar')
        const updated: Row = data.contact
        setRows((rs) => rs.map(x => x.id===id ? updated : x))
        setDraft(({[id]:_, ...rest}) => rest)
        flash('Guardado')
    } catch (e:any) {
      flash('Error: '+(e.message||e))
    }
  }

  function flash(t:string){ setMsg(t); setTimeout(()=>setMsg(''), 2000) }

  const filtered = rows.filter(r=>{
    if (filter==='all') return !r.archived
      if (filter==='archived') return r.archived
        return !r.archived && r.status===filter
  })

  const Badge = ({ status }: { status: Row['status'] }) => {
    const cls =
    status === 'done'
    ? 'bg-green-100 text-green-700'
    : status === 'in_progress'
    ? 'bg-amber-100 text-amber-800'
    : 'bg-blue-100 text-blue-700'
    return <span className={`px-2 py-0.5 rounded-full text-xs ${cls}`}>{status}</span>
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
    <div className="mb-6 flex items-center justify-between gap-3">
    <h1 className="text-2xl font-bold" style={{color:'#1E3A8A'}}>Admin — Contactos</h1>
    <div className="flex gap-2">
    <Link href="/admin" className="btn-secondary">← Volver</Link>
    <button onClick={load} className="btn-secondary">↻ Recargar</button>
    </div>
    </div>

    {msg && <div className="mb-4 rounded-xl border p-3 text-sm bg-blue-50 text-blue-700">{msg}</div>}

    <div className="mb-4 flex flex-wrap items-center gap-2">
    <span className="text-sm text-slate-600">Filtrar:</span>
    {(['all','new','in_progress','done','archived'] as const).map(f=>(
      <button key={f}
      onClick={()=>setFilter(f)}
      className={`btn-secondary ${filter===f ? 'ring-1 ring-blue-300' : ''}`}>
      {f}
      </button>
    ))}
    </div>

    {loading ? (
      <div className="rounded-xl border p-4">Cargando…</div>
    ) : filtered.length === 0 ? (
      <div className="rounded-xl border p-6 text-center text-slate-600">Sin contactos.</div>
    ) : (
      <>
      {/* ===== Vista móvil: cards compactas con "Abrir →" ===== */}
      <div className="grid gap-3 sm:hidden">
      {filtered.map((r) => (
        <Link
        key={r.id}
        href={`/admin/contacts/${r.id}`}
        className="card p-4 shadow-soft hover:shadow-md transition"
        >
        <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
        <div className="text-[11px] text-slate-500">
        {new Date(r.created_at).toLocaleString()}
        </div>
        <div className="mt-0.5 font-medium text-slate-900 truncate">
        {r.name}{r.company ? ` — ${r.company}` : ''}
        </div>
        <div className="mt-1 text-xs text-slate-600">
        {r.email}{r.phone ? ` · ${r.phone}` : ''}
        </div>
        <div className="mt-2 text-sm text-slate-700 line-clamp-2">
        {r.message}
        </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
        <Badge status={r.status} />
        <span className="btn-secondary px-3 py-1 text-xs">Abrir →</span>
        </div>
        </div>
        </Link>
      ))}
      </div>

      {/* ===== Vista desktop: tabla con edición rápida (sin notas) ===== */}
      <div className="overflow-x-auto rounded-2xl border bg-white hidden sm:block">
      <table className="min-w-full text-sm">
      <thead className="bg-gray-50">
      <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
      <th className="whitespace-nowrap">Fecha</th>
      <th className="whitespace-nowrap">Nombre / Empresa</th>
      <th className="whitespace-nowrap">Contacto</th>
      <th className="whitespace-nowrap">Ver</th>
      <th>Mensaje</th>
      <th className="whitespace-nowrap">Estado</th>
      <th className="whitespace-nowrap">Archiv.</th>
      <th className="whitespace-nowrap">Guardar</th>
      </tr>
      </thead>
      <tbody className="[&>tr>*]:px-3 [&>tr>*]:py-2">
      {filtered.map(r=>{
        const d = draft[r.id]||{}
        return (
          <tr key={r.id} className="border-t align-top">
          <td className="whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
          <td className="whitespace-nowrap">
          <div className="font-medium text-slate-900">{r.name}</div>
          <div className="text-xs text-slate-500">{r.company || '—'}</div>
          </td>
          <td className="whitespace-nowrap">
          <div>{r.email}</div>
          <div className="text-xs text-slate-500">{r.phone || '—'}</div>
          </td>
          {/* Columna Ver adelantada para evitar scroll largo */}
          <td className="whitespace-nowrap">
          <Link href={`/admin/contacts/${r.id}`} className="btn-secondary">
          Abrir →
          </Link>
          </td>
          <td className="max-w-[22rem]">
          <div className="text-slate-700 line-clamp-2">{r.message}</div>
          </td>
          <td className="whitespace-nowrap">
          <select
          defaultValue={r.status}
          onChange={e=>setField(r.id, 'status', e.target.value as Row['status'])}
          className="rounded border px-2 py-1">
          <option value="new">new</option>
          <option value="in_progress">in_progress</option>
          <option value="done">done</option>
          </select>
          </td>
          <td className="text-center">
          <input
          type="checkbox"
          defaultChecked={r.archived}
          onChange={e=>setField(r.id, 'archived', e.target.checked)}
          />
          </td>
          <td className="whitespace-nowrap">
          <button
          disabled={!changedIds.has(r.id)}
          onClick={()=>save(r.id)}
          className={`btn-primary ${!changedIds.has(r.id) ? 'opacity-40 pointer-events-none' : ''}`}>
          Guardar
          </button>
          </td>
          </tr>
        )
      })}
      </tbody>
      </table>
      </div>
      </>
    )}
    </main>
  )
}
