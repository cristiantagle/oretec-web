"use client"

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import FadeIn from '@/components/FadeIn'

type APICourse = Record<string, any>

export default function CourseDetailPage() {
    const params = useParams<{ slug: string }>()
    const router = useRouter()
    const slug = (params?.slug ?? '').toString().toLowerCase()

    const [courses, setCourses] = useState<APICourse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let alive = true
        async function load() {
            setLoading(true)
            setError(null)
            try {
                const r = await fetch('/api/public/courses', { cache: 'no-store' })
                if (!r.ok) throw new Error('No se pudo cargar el curso')
                    const data = await r.json()
                    if (!alive) return
                        setCourses(Array.isArray(data) ? data : [])
            } catch (e: any) {
                if (!alive) return
                    setError(e?.message ?? 'Error al cargar')
            } finally {
                if (alive) setLoading(false)
            }
        }
        load()
        return () => { alive = false }
    }, [])

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
                    const m = v.match(/(\d{1,3})/)
                    if (m) return parseInt(m[1], 10)
                }
                return null
    }

    const matchBySlug = (c: APICourse): boolean => {
        const code = (firstOf(c, ['code','course_code','sku','codigo','código','slug']) ?? '').toString().toLowerCase()
        if (code && code === slug) return true
            // fallback: si no hay code, intenta con title normalizado
            const title = (firstOf(c, ['title','course_title','name']) ?? '').toString().toLowerCase().replace(/\s+/g, '-')
            return title === slug
    }

    const course = useMemo(() => courses.find(matchBySlug) ?? null, [courses, slug])

    const title = course ? (firstOf(course, ['title','course_title','name','titulo','nombre']) as string) : ''
    const code  = course ? (firstOf(course, ['code','course_code','sku','codigo','código','slug']) as string) : ''
    const desc  = course ? (firstOf(course, ['description','summary','desc','descripcion','descripción','resumen']) as string) : null
    const hrs   = course ? toHours(firstOf(course, ['hours','horas','duration','duracion','duración','duration_hours','hrs'])) : null

    const cents = course ? toInt(firstOf(course, ['price_cents','precio_centavos','pricing.price_cents'])) : null
    let price: number | null = null
    if (cents != null) price = Math.round(cents / 100)
        else price = course ? toInt(firstOf(course, ['price','precio','valor','monto','amount','price_clp','precio_clp','valor_clp','pricing.price','pricing.amount','pricing.price_clp'])) : null

            const buy =
            (course ? firstOf(course, ['mp_url','mercado_pago_url','payment_link','checkout_url','buy_url','url','links.buy','links.checkout']) : null) as string | null

            const clp = (n?: number | null) =>
            (n || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

            if (loading) {
                return (
                    <main className="mx-auto max-w-3xl px-4 py-10">
                    <div className="h-6 w-64 animate-pulse rounded bg-slate-100" />
                    <div className="mt-4 h-4 w-80 animate-pulse rounded bg-slate-100" />
                    <div className="mt-8 h-10 w-40 animate-pulse rounded bg-slate-200" />
                    </main>
                )
            }

            if (error) {
                return (
                    <main className="mx-auto max-w-3xl px-4 py-10">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
                    <div className="mt-6">
                    <Link href="/courses" className="underline text-slate-700">⟵ Volver al catálogo</Link>
                    </div>
                    </main>
                )
            }

            if (!course) {
                return (
                    <main className="mx-auto max-w-3xl px-4 py-10">
                    <h1 className="text-xl font-semibold text-slate-900">Curso no encontrado</h1>
                    <p className="mt-2 text-slate-600">Revisa el enlace o vuelve al catálogo.</p>
                    <div className="mt-6">
                    <Link href="/courses" className="rounded-xl border px-4 py-2 text-sm">⟵ Volver al catálogo</Link>
                    </div>
                    </main>
                )
            }

            return (
                <main className="mx-auto max-w-3xl px-4 py-10">
                <FadeIn>
                <div className="text-xs uppercase tracking-wide text-slate-500">{code || 'Curso'}</div>
                <h1 className="mt-1 text-2xl font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                {title}
                </h1>
                {desc && <p className="mt-2 text-slate-600">{desc}</p>}

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-700">
                <div>⏱ Horas: {typeof hrs === 'number' ? hrs : '-'}</div>
                <div>💳 Precio: {typeof price === 'number' ? clp(price) : 'Consultar'}</div>
                </div>

                <div className="mt-6 flex gap-3">
                {buy ? (
                    <Link href={buy} className="rounded-xl bg-[#1E3A8A] px-5 py-3 text-sm font-medium text-white hover:opacity-95">
                    Matricularme
                    </Link>
                ) : (
                    <>
                    <Link
                    href={`/dashboard/proof?course=${encodeURIComponent(title)}`}
                    className="rounded-xl border border-[#1E3A8A] px-5 py-3 text-sm font-medium text-[#1E3A8A] hover:bg-[#1E3A8A]/5"
                    >
                    Enviar comprobante
                    </Link>
                    </>
                )}
                <Link href="/courses" className="rounded-xl border px-5 py-3 text-sm">
                ⟵ Volver al catálogo
                </Link>
                </div>
                </FadeIn>
                </main>
            )
}
