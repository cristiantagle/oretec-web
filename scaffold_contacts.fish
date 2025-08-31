# === Crear Contactos (página pública, endpoints, admin y migración) ===
# Ejecuta desde la raíz del proyecto (fish shell)

python3 - <<'PY'
import os, textwrap, time

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.lstrip("\n"))
    print("✓ wrote", path)

# 1) Página pública /contact
contact_page = """
'use client'
import { useState } from 'react'
import SectionTitle from '@/components/SectionTitle'
import Link from 'next/link'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    hp: '', // honeypot anti-spam (dejar vacío)
  })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErr(null)
    try {
      const r = await fetch('/api/public/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data?.error || 'No se pudo enviar el mensaje')
      setOk(true)
      setForm({ name: '', email: '', phone: '', company: '', message: '', hp: '' })
    } catch (e: any) {
      setErr(e?.message || 'Error al enviar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <SectionTitle subtitle="¿Tienes dudas o necesitas una propuesta a medida? Escríbenos y te contactamos.">
        Contáctanos
      </SectionTitle>

      <div className="grid items-stretch gap-8 md:grid-cols-2">
        {/* Panel formulario */}
        <div className="relative overflow-hidden rounded-2xl border bg-white p-6 shadow-soft">
          {/* halo suave */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-[1px] rounded-[18px]"
            style={{ boxShadow: '0 0 0 1px rgba(30,58,138,0.08)' }}
          />
          {ok ? (
            <div className="text-center py-10">
              <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-700 text-xl">✓</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">¡Mensaje enviado!</h3>
              <p className="mt-1 text-slate-600">Gracias por escribirnos. Te responderemos a la brevedad.</p>
              <div className="mt-5 flex justify-center gap-3">
                <Link href="/courses" className="btn-primary">Ver cursos</Link>
                <Link href="/" className="btn-secondary">Volver al inicio</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-4">
              {err && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {err}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm text-slate-600">Nombre *</label>
                  <input
                    required
                    className="mt-1 w-full rounded-lg border px-3 py-2 outline-none transition focus:ring-2 focus:ring-blue-200"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600">Email *</label>
                  <input
                    type="email"
                    required
                    className="mt-1 w-full rounded-lg border px-3 py-2 outline-none transition focus:ring-2 focus:ring-blue-200"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="tu@correo.cl"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm text-slate-600">Teléfono</label>
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2 outline-none transition focus:ring-2 focus:ring-blue-200"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+56 9 1234 5678"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600">Empresa</label>
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2 outline-none transition focus:ring-2 focus:ring-blue-200"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="Nombre de la empresa"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-600">Mensaje *</label>
                <textarea
                  required
                  rows={4}
                  className="mt-1 w-full rounded-lg border px-3 py-2 outline-none transition focus:ring-2 focus:ring-blue-200"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Cuéntanos brevemente qué necesitas…"
                />
              </div>

              {/* honeypot (oculto) */}
              <input
                type="text"
                value={form.hp}
                onChange={(e) => setForm({ ...form, hp: e.target.value })}
                className="hidden"
                autoComplete="off"
                tabIndex={-1}
              />

              <div className="pt-1">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Enviando…' : 'Enviar mensaje'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Ilustración SVG y puntos de confianza */}
        <div className="relative overflow-hidden rounded-2xl border bg-white p-6 shadow-soft">
          <div className="absolute inset-0 -z-10 bg-oret-gradient" />
          <img
            src="/images/contact-abstract.svg"
            alt="Contacto OreTec"
            className="mx-auto h-64 w-auto"
            loading="eager"
          />
          <ul className="mt-6 grid gap-3 text-sm text-slate-700">
            <li>• Respuesta en horario hábil</li>
            <li>• Propuestas a medida para empresas</li>
            <li>• 100% online — Certificación digital</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
"""

# 2) API pública: POST /api/public/contacts
api_public_contacts = """
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const bad = (msg: string, code = 400) =>
    new Response(JSON.stringify({ error: msg }), { status: code, headers: { 'Content-Type': 'application/json' } })

  const json = await req.json().catch(() => null)
  if (!json) return bad('JSON inválido')

  const s = (x: any) => (typeof x === 'string' ? x.trim() : '')
  const name = s(json.name)
  const email = s(json.email)
  const phone = s(json.phone) || null
  const company = s(json.company) || null
  const message = s(json.message)
  const hp = s(json.hp)

  if (hp) return new Response(JSON.stringify({ ok: true }), { status: 200 }) // honeypot => ignorar silenciosamente
  if (!name || !email || !message) return bad('Faltan campos requeridos (name, email, message)')

  if (!email.includes('@') || email.length > 160) return bad('Email inválido')
  if (name.length > 160) return bad('Nombre demasiado largo')
  if (company && company.length > 160) return bad('Empresa demasiado larga')
  if (phone && phone.length > 60) return bad('Teléfono demasiado largo')
  if (message.length > 4000) return bad('Mensaje demasiado largo')

  const supabase = supabaseServer()
  const { error } = await supabase
    .from('contacts')
    .insert([{ name, email, phone, company, message, status: 'new' }])

  if (error) {
    return bad('Error al guardar', 500)
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
"""

# 3) Admin API: list & update
api_admin_contacts_list = """
import { supabaseServer } from '@/lib/supabase/server'
import { requireAdmin } from '../../testimonials/_auth'

export async function GET() {
  const unauth = requireAdmin()
  if (unauth) return unauth

  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from('contacts')
    .select('id, created_at, name, email, phone, company, message, status, archived, admin_notes')
    .order('created_at', { ascending: false })

  if (error) {
    return new Response(JSON.stringify({ error: 'DB error', detail: error.message }), { status: 500 })
  }
  return Response.json(data || [])
}
"""

api_admin_contacts_update = """
import { supabaseServer } from '@/lib/supabase/server'
import { requireAdmin } from '../../testimonials/_auth'

export async function POST(req: Request) {
  const unauth = requireAdmin()
  if (unauth) return unauth

  const body = await req.json().catch(() => ({}))
  const { id, status, archived, admin_notes } = body || {}
  if (!id) return new Response(JSON.stringify({ error: 'Falta id' }), { status: 400 })

  const allowed = ['new','in_progress','done']
  const update: Record<string, any> = {}
  if (typeof archived === 'boolean') update.archived = archived
  if (typeof admin_notes === 'string') update.admin_notes = admin_notes
  if (typeof status === 'string' && allowed.includes(status)) update.status = status

  if (!Object.keys(update).length) {
    return new Response(JSON.stringify({ error: 'Sin cambios' }), { status: 400 })
  }

  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from('contacts')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: 'DB error', detail: error.message }), { status: 500 })
  }
  return Response.json({ ok: true, contact: data })
}
"""

# 4) Admin page /admin/contacts
admin_contacts_page = """
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
"""

# 5) Migración SQL (contacts)
sql_contacts = """
-- contacts table
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  company text,
  message text not null,
  status text not null default 'new',    -- new | in_progress | done
  archived boolean not null default false,
  admin_notes text
);

alter table public.contacts enable row level security;

-- Sin políticas públicas de insert/select: sólo vía service role (bypass RLS)
-- (Los endpoints del servidor usan la service key; el cliente no puede escribir directo)

create index if not exists contacts_created_at_idx on public.contacts (created_at desc);
create index if not exists contacts_status_idx on public.contacts (status);
"""

# 6) SVG ilustración
svg_contact = """
<svg width="960" height="540" viewBox="0 0 960 540" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#1E3A8A" offset="0"/>
      <stop stop-color="#2563EB" offset="1"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="18" />
    </filter>
  </defs>
  <rect width="960" height="540" fill="#F6F9FF"/>
  <circle cx="160" cy="120" r="90" fill="url(#g)" opacity="0.18" filter="url(#soft)"/>
  <circle cx="830" cy="420" r="110" fill="url(#g)" opacity="0.16" filter="url(#soft)"/>
  <g transform="translate(180,110)">
    <rect x="0" y="0" rx="18" width="600" height="320" fill="white" stroke="#E5E7EB"/>
    <rect x="28" y="30" rx="8" width="260" height="18" fill="#E5ECFF"/>
    <rect x="28" y="60" rx="8" width="540" height="14" fill="#EEF2FF"/>
    <rect x="28" y="82" rx="8" width="500" height="14" fill="#EEF2FF"/>
    <rect x="28" y="130" rx="10" width="260" height="42" fill="#1E3A8A"/>
    <rect x="304" y="130" rx="10" width="260" height="42" fill="#2563EB" opacity="0.9"/>
    <rect x="28" y="190" rx="8" width="340" height="14" fill="#EEF2FF"/>
    <rect x="28" y="212" rx="8" width="300" height="14" fill="#EEF2FF"/>
    <rect x="28" y="234" rx="8" width="280" height="14" fill="#EEF2FF"/>
    <rect x="28" y="270" rx="10" width="180" height="36" fill="url(#g)"/>
  </g>
  <g transform="translate(650,160)">
    <circle cx="0" cy="0" r="60" fill="url(#g)"/>
    <rect x="-22" y="-8" width="44" height="16" rx="8" fill="white"/>
    <rect x="-30" y="20" width="60" height="10" rx="5" fill="white" opacity="0.7"/>
  </g>
</svg>
"""

# Write files
write("app/contact/page.tsx", contact_page)
write("app/api/public/contacts/route.ts", api_public_contacts)
write("app/api/admin/contacts/list/route.ts", api_admin_contacts_list)
write("app/api/admin/contacts/update/route.ts", api_admin_contacts_update)
write("app/admin/contacts/page.tsx", admin_contacts_page)
# Timestamped migration file
ts = time.strftime("%Y%m%d%H%M%S")
write(f"supabase/migrations/{ts}_add_contacts.sql", sql_contacts)
write("public/images/contact-abstract.svg", svg_contact)

print("\\nNext steps:")
print("1) npx supabase db push")
print("2) Abrir /contact para probar el formulario")
print("3) /admin/contacts para ver y gestionar leads (debes estar logueado como admin)")
PY
