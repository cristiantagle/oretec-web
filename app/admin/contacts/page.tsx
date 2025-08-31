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
  const [draft, setDraft] = useState<Record<string, Partial<Row>>>({})
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

  function setField(id: string, key: keyof Row, value: any) {
    setDraft((d) => ({ ...d, [id]: { ...(d[id]||{}), [key]: value } }))
  }

  async function save(id: string) {
    try {
      const r = await fetch('/api/admin/contacts/update', {
        method:'POST', headers:{'Content-Type':'application/json'},
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
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
                <th>Fecha</th>
                <th>Nombre / Empresa</th>
                <th>Contacto</th>
                <th>Mensaje</th>
                <th>Estado</th>
                <th>Archivado</th>
                <th>Notas</th>
                <th>Guardar</th>
              </tr>
            </thead>
            <tbody className="[&>tr>*]:px-3 [&>tr>*]:py-2">
              {filtered.map(r=>{
                const d = draft[r.id]||{}
                return (
                  <tr key={r.id} className="border-t align-top">
                    <td className="whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                    <td>
                      <div className="font-medium text-slate-900">{r.name}</div>
                      <div className="text-xs text-slate-500">{r.company || '—'}</div>
                    </td>
                    <td>
                      <div>{r.email}</div>
                      <div className="text-xs text-slate-500">{r.phone || '—'}</div>
                    </td>
                    <td className="max-w-[28rem]">
                      <div className="whitespace-pre-wrap text-slate-700">{r.message}</div>
                    </td>
                    <td>
                      <select
                        defaultValue={r.status}
                        onChange={e=>setField(r.id, 'status', e.target.value)}
                        className="rounded border px-2 py-1">
                        <option value="new">new</option>
                        <option value="in_progress">in_progress</option>
                        <option value="done">done</option>
                      </select>
                    </td>
                    <td className="text-center">
                      <input type="checkbox" defaultChecked={r.archived}
                        onChange={e=>setField(r.id, 'archived', e.target.checked)} />
                    </td>
                    <td>
                      <textarea className="w-60 rounded border px-2 py-1" rows={2}
                        placeholder="Notas internas"
                        defaultValue={r.admin_notes || ''}
                        onChange={e=>setField(r.id,'admin_notes', e.target.value)} />
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
              {!filtered.length && (
                <tr><td colSpan={8} className="py-10 text-center text-slate-500">Sin contactos.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
