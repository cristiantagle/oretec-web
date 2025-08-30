// components/Testimonials.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import FadeIn from '@/components/FadeIn'

type Testimonial = {
    id?: string
    quote: string
    name: string
    role: string
    initials: string
}

const LOCAL_ITEMS: Testimonial[] = [
    {
        quote: 'Contenido claro y práctico. El proceso de certificación fue muy rápido.',
        name: 'María P.',
        role: 'Encargada de Prevención',
        initials: 'MP',
    },
{
    quote: 'Ideal para capacitar turnos. 100% online y con soporte excelente.',
    name: 'Carlos R.',
    role: 'Jefe de Operaciones',
    initials: 'CR',
},
{
    quote: 'Cumplimos la normativa sin interrumpir la producción. Recomendado.',
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
    // === Carga dinámica (sin romper tu carrusel) ===
    const [items, setItems] = useState<Testimonial[]>(LOCAL_ITEMS)
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        let alive = true
        async function load() {
            try {
                const ts = Date.now()
                const r = await fetch(`/api/public/testimonials?ts=${ts}`, { cache: 'no-store' })
                if (!r.ok) throw new Error('HTTP ' + r.status)
                    const data = await r.json()
                    if (!alive) return
                        if (Array.isArray(data) && data.length) {
                            // Normalizamos a tu shape (por si vienen nulls)
                            const norm: Testimonial[] = data.map((d: any) => ({
                                id: d.id,
                                quote: String(d.quote ?? ''),
                                                                              name: String(d.name ?? ''),
                                                                              role: String(d.role ?? ''),
                                                                              initials: String(d.initials ?? (d.name?.split(' ')?.map((w:string)=>w[0]).slice(0,2).join('') ?? '')).toUpperCase(),
                            })).filter((t: Testimonial) => t.quote && t.name)
                            if (norm.length) setItems(norm)
                        }
            } catch {
                // Silencioso: nos quedamos con LOCAL_ITEMS
            } finally {
                if (alive) setLoaded(true)
            }
        }
        load()
        return () => { alive = false }
    }, [])

    // === Tu carrusel intacto ===
    const trackRef = useRef<HTMLDivElement | null>(null)
    const [atStart, setAtStart] = useState(true)
    const [atEnd, setAtEnd] = useState(false)

    const updateEdges = () => {
        const el = trackRef.current
        if (!el) return
            const { scrollLeft, scrollWidth, clientWidth } = el
            setAtStart(scrollLeft <= 2)
            setAtEnd(scrollLeft + clientWidth >= scrollWidth - 2)
    }

    useEffect(() => {
        updateEdges()
        const el = trackRef.current
        if (!el) return
            const onScroll = () => updateEdges()
            el.addEventListener('scroll', onScroll, { passive: true })
            return () => el.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        const el = trackRef.current
        if (!el) return
            let userInteracting = false
            const onPointerDown = () => (userInteracting = true)
            const onPointerUp = () => { userInteracting = false }
            el.addEventListener('pointerdown', onPointerDown)
            window.addEventListener('pointerup', onPointerUp)

            const id = setInterval(() => {
                if (!el || userInteracting) return
                    const next = el.scrollLeft + el.clientWidth * 0.9
                    if (next >= el.scrollWidth - el.clientWidth) {
                        el.scrollTo({ left: 0, behavior: 'smooth' })
                    } else {
                        el.scrollTo({ left: next, behavior: 'smooth' })
                    }
            }, 4500)

            return () => {
                clearInterval(id)
                el.removeEventListener('pointerdown', onPointerDown)
                window.removeEventListener('pointerup', onPointerUp)
            }
    }, [])

    const scrollByPage = (dir: -1 | 1) => {
        const el = trackRef.current
        if (!el) return
            const delta = el.clientWidth * 0.95 * dir
            el.scrollBy({ left: delta, behavior: 'smooth' })
    }

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

        {/* Carrusel */}
        <div className="relative">
        {/* Gradientes laterales */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent" />

        {/* Pista scrollable con snap */}
        <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-2"
        style={{ scrollbarWidth: 'none' }}
        onWheel={updateEdges}
        onTouchMove={updateEdges}
        >
        {items.map((t, i) => (
            <FadeIn key={t.id ?? `${t.name}-${i}`} delay={0.04 * (i + 1)}>
            <article className="card shadow-soft hover:shadow-md transition-all duration-300 ease-out snap-start min-w-[88%] sm:min-w-[48%] lg:min-w-[32%] bg-white p-6">
            <div className="flex items-center justify-between">
            <Stars />
            <QuoteMark />
            </div>

            <p className="mt-3 text-slate-700">
            “{t.quote}”
            </p>

            <div className="mt-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-white text-sm font-semibold">
            {t.initials}
            </div>
            <div>
            <div className="font-medium text-slate-900">{t.name}</div>
            <div className="text-xs text-slate-500">{t.role}</div>
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
        onClick={() => scrollByPage(-1)}
        className={`btn-secondary ${atStart ? 'opacity-40 cursor-not-allowed' : ''}`}
        aria-label="Ver testimonios anteriores"
        disabled={atStart}
        >
        ← Anterior
        </button>
        <button
        type="button"
        onClick={() => scrollByPage(1)}
        className={`btn-primary ${atEnd ? 'opacity-40 cursor-not-allowed' : ''}`}
        aria-label="Ver más testimonios"
        disabled={atEnd}
        >
        Siguiente →
        </button>
        </div>
        </div>
        </section>
    )
}
