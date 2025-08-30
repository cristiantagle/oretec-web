'use client'

import { useEffect, useRef, useState } from 'react'
import FadeIn from '@/components/FadeIn'

type Testimonial = {
    id?: string
    quote: string
    name: string
    role: string | null
    initials: string | null
}

// Fallback local si la API no devuelve nada
const FALLBACK: Testimonial[] = [
    {
        quote:
        'Contenido claro y práctico. El proceso de certificación fue muy rápido.',
        name: 'María P.',
        role: 'Encargada de Prevención',
        initials: 'MP',
    },
{
    quote:
    'Ideal para capacitar turnos. 100% online y con soporte excelente.',
    name: 'Carlos R.',
    role: 'Jefe de Operaciones',
    initials: 'CR',
},
{
    quote:
    'Cumplimos la normativa sin interrumpir la producción. Recomendado.',
    name: 'Valentina G.',
    role: 'RRHH',
    initials: 'VG',
},
]

function Stars() {
    return (
        <div className="flex gap-0.5" aria-label="5 de 5 estrellas">
        {Array.from({ length: 5 }).map((_, i) => (
            <svg
            key={i}
            viewBox="0 0 20 20"
            width="16"
            height="16"
            aria-hidden
            className="text-amber-500 fill-current"
            >
            <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 15.9l-5.2 2.6.99-5.78L1.58 7.62l5.82-.85L10 1.5z" />
            </svg>
        ))}
        </div>
    )
}

function QuoteMark() {
    return (
        <svg
        viewBox="0 0 48 48"
        width="28"
        height="28"
        aria-hidden
        className="text-blue-700/20 fill-current"
        >
        <path d="M17 10c-4.4 0-8 3.6-8 8v6c0 4.4 3.6 8 8 8h3v-8h-5v-2c0-2.2 1.8-4 4-4h1V10h-3zm21 0c-4.4 0-8 3.6-8 8v6c0 4.4 3.6 8 8 8h3v-8h-5v-2c0-2.2 1.8-4 4-4h1V10h-3z" />
        </svg>
    )
}

export default function Testimonials() {
    const [items, setItems] = useState<Testimonial[]>([])
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [atStart, setAtStart] = useState(true)
    const [atEnd, setAtEnd] = useState(false)

    const trackRef = useRef<HTMLDivElement | null>(null)

    // Cargar testimonios publicados desde la API pública
    useEffect(() => {
        let ok = true
        ;(async () => {
            setLoading(true)
            try {
                const ts = Date.now()
                const r = await fetch(`/api/public/testimonials?ts=${ts}`, { cache: 'no-store' })
                const data = await r.json().catch(() => [])
                if (!ok) return
                    const arr = Array.isArray(data) ? data : []
                    setItems(arr.length ? arr : FALLBACK)
            } catch {
                setItems(FALLBACK)
            } finally {
                setLoading(false)
                // Espera un frame para medir correctamente el ancho
                requestAnimationFrame(() => updateEdges())
            }
        })()
        return () => { ok = false }
    }, [])

    const TOL = 2 // tolerancia px para cálculo de bordes

    const updateEdges = () => {
        const el = trackRef.current
        if (!el) return
            const { scrollLeft, scrollWidth, clientWidth } = el
            setAtStart(scrollLeft <= TOL)
            setAtEnd(scrollLeft + clientWidth >= scrollWidth - TOL)
    }

    useEffect(() => {
        const el = trackRef.current
        if (!el) return
            const onScroll = () => updateEdges()
            el.addEventListener('scroll', onScroll, { passive: true })
            window.addEventListener('resize', updateEdges)
            return () => {
                el.removeEventListener('scroll', onScroll)
                window.removeEventListener('resize', updateEdges)
            }
    }, [])

    const scrollByPage = (dir: -1 | 1) => {
        const el = trackRef.current
        if (!el) return
            const delta = el.clientWidth * dir
            el.scrollBy({ left: delta, behavior: 'smooth' })
    }

    const testimonialsToShow = items.slice(currentIndex, currentIndex + 3)

    return (
        <section className="mx-auto max-w-6xl px-4 py-16">
        <FadeIn>
        <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold text-slate-900">
        Qué dicen nuestros clientes
        </h2>
        <p className="mt-2 text-slate-600">
        Empresas y profesionales que ya capacitan con OreTec.
        </p>
        </div>
        </FadeIn>

        {/* Estado de carga */}
        {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card shadow-soft p-6 animate-pulse">
                <div className="h-4 w-24 rounded bg-slate-100" />
                <div className="mt-3 h-4 w-3/4 rounded bg-slate-100" />
                <div className="mt-2 h-4 w-1/2 rounded bg-slate-100" />
                <div className="mt-5 h-8 w-32 rounded bg-slate-100" />
                </div>
            ))}
            </div>
        ) : (
            <div className="relative">
            {/* Gradientes laterales */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent" />

            {/* Pista scrollable (1/2/3 por vista) */}
            <div
            ref={trackRef}
            className="flex gap-4 overflow-x-auto scroll-smooth px-1 pb-2"
            style={{ scrollbarWidth: 'none' }}
            onWheel={updateEdges}
            onTouchMove={updateEdges}
            >
            {testimonialsToShow.map((t, i) => (
                <FadeIn key={t.id || i} delay={0.03 * (i + 1)}>
                <article
                className="card shadow-soft hover:shadow-md transition-all duration-300 ease-out bg-white p-6
                flex-none min-w-[88%] sm:min-w-[48%] lg:min-w-[32%]"
                >
                <div className="flex items-center justify-between">
                <Stars />
                <QuoteMark />
                </div>

                <p className="mt-3 text-slate-700">“{t.quote}”</p>

                <div className="mt-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-white text-sm font-semibold">
                {t.initials || (t.name?.slice(0, 2).toUpperCase() ?? 'UX')}
                </div>
                <div>
                <div className="font-medium text-slate-900">{t.name}</div>
                {t.role && <div className="text-xs text-slate-500">{t.role}</div>}
                </div>
                </div>
                </article>
                </FadeIn>
            ))}
            </div>

            {/* Controles */}
            <div className="mt-4 flex justify-center gap-2">
            <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.max(prev - 3, 0))}
            className={`btn-secondary ${currentIndex === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
            disabled={currentIndex === 0}
            >
            ← Anterior
            </button>
            <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.min(prev + 3, items.length - 1))}
            className={`btn-primary ${currentIndex + 3 >= items.length ? 'opacity-40 cursor-not-allowed' : ''}`}
            disabled={currentIndex + 3 >= items.length}
            >
            Siguiente →
            </button>
            </div>
            </div>
        )}
        </section>
    )
}
