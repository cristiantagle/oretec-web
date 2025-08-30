'use client'

import { useEffect, useState } from 'react'
import CourseCard from '@/components/CourseCard'
import FadeIn from '@/components/FadeIn'
import BackButton from '@/components/BackButton'
import SectionTitle from '@/components/SectionTitle'

type APICourse = Record<string, any>

export default function CoursesPage() {
  const [courses, setCourses] = useState<APICourse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0) // para forzar recargas

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const ts = Date.now()
      const r = await fetch(`/api/public/courses?ts=${ts}&n=${nonce}`, { cache: 'no-store' })
      if (!r.ok) throw new Error(await r.text().catch(() => `HTTP ${r.status}`))
        const data = await r.json()
        if (!Array.isArray(data)) throw new Error('Respuesta del API no es un arreglo')
          setCourses(data)
    } catch (e: any) {
      setError(e?.message ?? 'No se pudieron cargar los cursos')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [nonce])

  // helpers
  const toInt = (v: any): number | null => {
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

  const toHours = (v: any): number | null => {
    if (v == null) return null
      if (typeof v === 'number' && Number.isFinite(v)) return Math.round(v)
        if (typeof v === 'string') {
          const m = v.match(/(\d{1,3})/); if (m) return parseInt(m[1], 10)
        }
        return null
  }

  const firstOf = (obj: any, keys: string[]): any => {
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

  const courseTitle = (c: APICourse): string =>
  (firstOf(c, ['title','course_title','name','titulo','nombre']) as string) ?? 'Curso'

  const courseCode = (c: APICourse): string | null =>
  (firstOf(c, ['code','course_code','sku','codigo','código','slug']) as string) ?? null

  const courseDesc = (c: APICourse): string | null =>
  (firstOf(c, ['description','summary','desc','descripcion','descripción','resumen']) as string) ?? null

  const priceCLP = (c: APICourse): number | null => {
    const centsLikePesos = firstOf(c, ['price_cents', 'price_clp', 'price'])
    return toInt(centsLikePesos)
  }

  const hours = (c: APICourse): number | null =>
  toHours(firstOf(c, ['hours','horas','duration','duracion','duración','duration_hours','hrs','meta.hours']))

  const buyLink = (c: APICourse): string | null =>
  (firstOf(c, ['mp_link','mercado_pago_url','mp_url','payment_link','checkout_url','buy_url','url','links.buy','links.checkout']) as string) ?? null

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
    {/* Título unificado */}
    <FadeIn>
    <SectionTitle subtitle="Formación e-learning en prevención y seguridad laboral — Chile.">
    Catálogo de cursos
    </SectionTitle>
    </FadeIn>

    {/* Acciones (abajo del título) */}
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
    <BackButton label="← Volver al inicio" href="/" />
    <button
    onClick={() => { setNonce(n => n + 1); load() }}
    className="btn-secondary"
    title="Forzar recarga (sin caché)"
    type="button"
    >
    ↻ Actualizar
    </button>
    </div>

    {loading ? (
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5">
        <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
        <div className="mt-2 h-6 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="mt-3 flex gap-3">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="mt-4 h-9 w-32 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
      </div>
    ) : error ? (
      <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {error}
      </div>
    ) : (
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((c) => (
        <FadeIn
        key={(c.id as string) || (c.slug as string) || (c.code as string) || courseTitle(c)}
        delay={0.03}
        >
        <CourseCard
        title={courseTitle(c)}
        code={courseCode(c)}
        hours={hours(c)}
        priceCLP={priceCLP(c)}
        href={buyLink(c)}
        description={courseDesc(c)}
        />
        </FadeIn>
      ))}
      {courses.length === 0 && (
        <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600">
        No hay cursos disponibles por el momento.
        </div>
      )}
      </div>
    )}
    </main>
  )
}
