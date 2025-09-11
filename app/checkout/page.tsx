// app/checkout/page.tsx
"use client"

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter, Link } from 'next/navigation'

type APICourse = Record<string, any>

function firstOf(obj: any, keys: string[]): any {
  for (const k of keys) {
    if (!obj) continue
    if (k.includes('.')) {
      const val = k.split('.').reduce((acc: any, part) => (acc ? acc[part] : undefined), obj)
      if (val != null) return val
    } else if (k in obj && obj[k] != null) {
      return obj[k]
    }
  }
  return null
}

function toInt(v: any): number | null {
  if (v == null) return null
  if (typeof v === 'number' && Number.isFinite(v)) return Math.round(v)
  if (typeof v === 'string') {
    const digits = v.replace(/[^\d]/g, '')
    if (!digits) return null
    const n = parseInt(digits, 10)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function decodeParticipantsParam(b64: string | null): { courseId?: string, participants?: Array<{full_name:string, email:string, rut?:string, phone?:string}> } | null {
  if (!b64) return null
  try {
    const json = typeof window !== 'undefined'
      ? decodeURIComponent(escape(window.atob(b64)))
      : Buffer.from(b64, 'base64').toString('utf-8')
    const parsed = JSON.parse(json)
    if (parsed && typeof parsed === 'object') return parsed
  } catch {}
  return null
}

export default function CheckoutPage() {
  const sp = useSearchParams()
  const router = useRouter()
  const slug = (sp.get('course') || '').toLowerCase()
  const participantsParam = sp.get('participants')

  const decoded = useMemo(() => decodeParticipantsParam(participantsParam), [participantsParam])
  const party = decoded?.participants ?? []

  const [course, setCourse] = useState<APICourse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let alive = true
    async function load() {
      if (!slug) { setError('Falta curso'); setLoading(false); return }
      try {
        const r = await fetch('/api/public/courses', { cache: 'no-store' })
        if (!r.ok) throw new Error('No se pudo cargar el curso')
        const list = await r.json()
        const match = Array.isArray(list) ? list.find((c:any) => {
          const code = (firstOf(c, ['code','course_code','sku','codigo','código','slug']) ?? '').toString().toLowerCase()
          if (code && code === slug) return true
          const title = (firstOf(c, ['title','course_title','name']) ?? '').toString().toLowerCase().replace(/\s+/g, '-')
          return title === slug
        }) : null
        if (!alive) return
        if (!match) { setError('Curso no encontrado'); return }
        setCourse(match)
      } catch (e:any) {
        if (!alive) return
        setError(e?.message || 'Error')
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [slug])

  const cents = course ? toInt(firstOf(course, ['price_cents','precio_centavos','pricing.price_cents'])) : null
  const price = cents != null ? Math.round(cents/100)
    : (course ? toInt(firstOf(course, ['price','precio','valor','monto','amount','price_clp','precio_clp','valor_clp','pricing.price','pricing.amount','pricing.price_clp'])) : null) || 0

  const mp =
    (course ? firstOf(course, ['mp_link','mp_url','mercado_pago_url','payment_link','checkout_url','buy_url','url','links.buy','links.checkout']) : null) as string | null

  const clp = (n?: number | null) =>
    (n || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

  const title = course ? (firstOf(course, ['title','course_title','name','titulo','nombre']) as string) : ''

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-xl border p-4">Cargando…</div>
      </main>
    )
  }

  if (error || !course) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error || 'No se pudo cargar el curso'}
        </div>
        <a href="/courses" className="btn-secondary">← Volver</a>
      </main>
    )
  }

  const subtotal = party.length * price

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold mb-1" style={{ color:'#1E3A8A' }}>Checkout</h1>
      <div className="text-slate-600 mb-4">Curso: <span className="font-medium text-slate-900">{title}</span></div>

      {party.length === 0 ? (
        <div className="rounded-xl border p-4 text-slate-600">
          No hay participantes. <a className="underline" href={`/courses/${encodeURIComponent(slug)}`}>Volver al curso</a>
        </div>
      ) : (
        <>
          <section className="rounded-2xl border bg-white p-5 shadow-soft">
            <div className="mb-2 text-sm text-slate-600">
              Participantes: <span className="font-medium">{party.length}</span> · Unitario: <span className="font-medium">{clp(price)}</span>
            </div>
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b bg-slate-50">
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Nombre</th>
                    <th className="py-2 px-3">Correo</th>
                    <th className="py-2 px-3">RUT</th>
                    <th className="py-2 px-3">Teléfono</th>
                    <th className="py-2 px-3 text-right">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {party.map((p, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-2 px-3">{i+1}</td>
                      <td className="py-2 px-3">{p.full_name || '-'}</td>
                      <td className="py-2 px-3">{p.email || '-'}</td>
                      <td className="py-2 px-3">{p.rut || '-'}</td>
                      <td className="py-2 px-3">{p.phone || '-'}</td>
                      <td className="py-2 px-3 text-right">{clp(price)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={5} className="py-2 px-3 text-right font-medium">Total</td>
                    <td className="py-2 px-3 text-right font-semibold">{clp(subtotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <a className="btn-secondary" href={`/courses/${encodeURIComponent(slug)}?participants=${encodeURIComponent(participantsParam || '')}`}>
                ← Volver al curso
              </a>
              {mp ? (
                <a
                  href={mp}
                  className="btn-primary"
                  title="Pagar ahora"
                >
                  Pagar ahora
                </a>
              ) : (
                <a
                  href={`/dashboard/proof?course=${encodeURIComponent(title)}`}
                  className="btn-primary"
                  title="Enviar comprobante"
                >
                  Enviar comprobante
                </a>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  )
}
