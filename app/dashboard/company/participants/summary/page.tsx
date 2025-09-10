// app/dashboard/company/participants/summary/page.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

type Participant = {
  full_name: string
  email: string
  rut?: string | null
  phone?: string | null
}

type Course = {
  id: string
  slug?: string | null
  title: string
  price: number
}

function money(n: number) {
  try {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)
  } catch {
    return `${n}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }
}

export default function CompanyParticipantsSummaryPage() {
  const router = useRouter()
  const search = useSearchParams()

  const courseIdOrSlug =
    search.get('course') || search.get('courseId') || search.get('slug') || ''

  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState<Course | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [error, setError] = useState<string>('')

  // Cargar participantes desde query (base64) o localStorage (clave usada en tu página actual)
  useEffect(() => {
    setLoading(true)
    setError('')
    try {
      let list: Participant[] = []
      const b64 = search.get('participants')
      if (b64) {
        try {
          const json = atob(b64)
          const parsed = JSON.parse(json)
          if (Array.isArray(parsed)) list = parsed.filter(Boolean)
        } catch {
          /* fallback a localStorage */
        }
      }
      if (list.length === 0) {
        const raw = localStorage.getItem('companyParticipantsDraft') // ajusta la clave si usas otra
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) list = parsed.filter(Boolean)
        }
      }
      setParticipants(list)
    } catch (e: any) {
      setError(e?.message || 'No se pudieron leer los participantes')
    } finally {
      setLoading(false)
    }
  }, [search])

  // Traer curso (ajusta al endpoint real si usas otro)
  useEffect(() => {
    let abort = false
    ;(async () => {
      if (!courseIdOrSlug) return
      try {
        const params = new URLSearchParams()
        if (/^\d+$/.test(courseIdOrSlug) || courseIdOrSlug.includes('-')) {
          params.set('slug', courseIdOrSlug)
        } else {
          params.set('id', courseIdOrSlug)
        }
        const r = await fetch(`/api/public/courses?${params.toString()}`, { cache: 'no-store' })
        if (!r.ok) throw new Error(`Cursos HTTP ${r.status}`)
        const j = await r.json()
        const first = Array.isArray(j?.items) ? j.items[0] : j
        if (!first) throw new Error('Curso no encontrado')

        const c: Course = {
          id: String(first.id ?? first.slug ?? courseIdOrSlug),
          slug: first.slug ?? null,
          title: String(first.title ?? first.name ?? 'Curso'),
          price: Number(first.price ?? first.amount ?? 0),
        }
        if (!abort) setCourse(c)
      } catch (e: any) {
        if (!abort) setError(e?.message || 'No se pudo cargar el curso')
      }
    })()
    return () => { abort = true }
  }, [courseIdOrSlug])

  const qty = participants.length
  const unit = course?.price ?? 0
  const subtotal = useMemo(() => unit * qty, [unit, qty])
  const total = subtotal // aquí puedes sumar IVA o descuentos

  function goToCheckout() {
    if (!course) return
    const payload = btoa(JSON.stringify(participants))
    const slugOrId = course.slug || course.id
    router.push(`/courses/${encodeURIComponent(slugOrId)}?participants=${encodeURIComponent(payload)}`)
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: '#1E3A8A' }}>
          Resumen de participantes
        </h1>
        <Link href="/dashboard/company/participants" className="btn-secondary">← Volver</Link>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-6">
        <div className="rounded-xl border bg-white p-5 shadow-soft">
          <div className="text-sm text-slate-500">Curso</div>
          <div className="text-lg font-medium text-slate-900">
            {course ? course.title : '—'}
          </div>
          <div className="mt-1 text-slate-600">
            Precio unitario: <span className="font-medium">{money(unit)}</span>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-soft overflow-auto">
          <div className="mb-3 font-medium text-slate-900">Participantes ({qty})</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-4">Nombre</th>
                <th className="py-2 pr-4">Correo</th>
                <th className="py-2 pr-4">RUT</th>
                <th className="py-2 pr-4">Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {qty === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">No hay participantes.</td>
                </tr>
              )}
              {participants.map((p, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2 pr-4">{p.full_name || '—'}</td>
                  <td className="py-2 pr-4">{p.email || '—'}</td>
                  <td className="py-2 pr-4">{p.rut || '—'}</td>
                  <td className="py-2 pr-4">{p.phone || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-soft">
          <div className="text-lg font-semibold text-slate-900 mb-2">Detalle</div>
          <div className="grid gap-1 text-slate-700">
            <div className="flex items-center justify-between">
              <span>Precio unitario</span>
              <span>{money(unit)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Cantidad</span>
              <span>{qty}</span>
            </div>
            <div className="flex items-center justify-between font-medium border-t pt-2 mt-2">
              <span>Total</span>
              <span>{money(total)}</span>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Link href="/dashboard/company/participants" className="btn-secondary">Editar participantes</Link>
            <button
              className="btn-primary"
              disabled={!course || qty === 0}
              onClick={goToCheckout}
            >
              Continuar a compra
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
