# scaffold_admin_contact_detail.fish
mkdir -p app/admin/contacts/[id]
if not test -f app/admin/contacts/[id]/page.tsx
  cat > app/admin/contacts/[id]/page.tsx << 'TSX'
'use client'
import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

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

export default function AdminContactDetailPage() {
  const params = useParams() as { id: string }
  const router = useRouter()
  const [item, setItem] = useState<Row | null>(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<string>('')

  // draft local
  const [status, setStatus] = useState<Row['status']>('new')
  const [archived, setArchived] = useState(false)
  const [notes, setNotes] = useState('')

  async function load() {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/contacts/list', { cache: 'no-store' })
      const data = await r.json()
      const arr: Row[] = Array.isArray(data) ? data : []
      const found = arr.find(x => x.id === params.id) || null
      setItem(found)
      if (found) {
        setStatus(found.status)
        setArchived(found.archived)
        setNotes(found.admin_notes || '')
      }
    } catch {
      setItem(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function flash(t:string){ setMsg(t); setTimeout(()=>setMsg(''), 2200) }

  async function save() {
    if (!item) return
    try {
      const r = await fetch('/api/admin/contacts/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, status, archived, admin_notes: notes })
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error || 'No se pudo guardar')
      flash('Cambios guardados')
    } catch (e:any) {
      flash('Error: ' + (e.message || e))
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold" style={{color:'#1E3A8A'}}>Admin — Contacto</h1>
        <div className="flex gap-2">
          <button onClick={() => router.back()} className="btn-secondary">← Volver</button>
          <button onClick={load} className="btn-secondary">↻ Recargar</button>
          <button onClick={save} className="btn-primary">💾 Guardar</button>
        </div>
      </div>

      {msg && <div className="mb-4 rounded-xl border p-3 text-sm bg-blue-50 text-blue-700">{msg}</div>}

      {loading ? (
        <div className="rounded-xl border p-4">Cargando…</div>
      ) : !item ? (
        <div className="rounded-xl border p-6 text-slate-600">
          No encontramos este contacto. <Link href="/admin/contacts" className="link">Volver al listado</Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Datos principales */}
          <section className="card p-5 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-600">
                <div className="font-medium text-slate-900">{item.name}</div>
                <div className="text-xs">{new Date(item.created_at).toLocaleString()}</div>
                <div className="mt-1 text-xs">{item.company || '—'}</div>
                <div className="mt-1 text-xs">
                  <a href={"mailto:" + item.email} className="link">{item.email}</a>
                  {item.phone ? <> · <a href={"tel:" + item.phone} className="link">{item.phone}</a></> : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as Row['status'])}
                  className="rounded border px-2 py-1 text-sm">
                  <option value="new">new</option>
                  <option value="in_progress">in_progress</option>
                  <option value="done">done</option>
                </select>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={archived} onChange={e=>setArchived(e.target.checked)} />
                  Archivado
                </label>
              </div>
            </div>
          </section>

          {/* Mensaje */}
          <section className="card p-5 shadow-soft">
            <div className="text-sm text-slate-700 whitespace-pre-wrap">
              {item.message}
            </div>
          </section>

          {/* Notas internas */}
          <section className="card p-5 shadow-soft">
            <div className="mb-2 text-sm font-medium text-slate-900">Notas internas</div>
            <textarea
              className="w-full rounded border px-3 py-2 text-sm min-h-[120px]"
              placeholder="Notas visibles solo para admin"
              value={notes}
              onChange={e=>setNotes(e.target.value)}
            />
            <div className="mt-3 flex justify-end">
              <button onClick={save} className="btn-primary">💾 Guardar</button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
TSX
  echo "✅ Creado app/admin/contacts/[id]/page.tsx"
else
  echo "ℹ️ Ya existía app/admin/contacts/[id]/page.tsx (no modificado)"
end
