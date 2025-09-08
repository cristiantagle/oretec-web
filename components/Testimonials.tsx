// components/Testimonials.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
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
    { quote: 'Contenido claro y práctico. El proceso de certificación fue muy rápido.', name: 'María P.', role: 'Encargada de Prevención', initials: 'MP' },
{ quote: 'Ideal para capacitar turnos. 100% online y con soporte excelente.', name: 'Carlos R.', role: 'Jefe de Operaciones', initials: 'CR' },
{ quote: 'Cumplimos la normativa sin interrumpir la producción. Recomendado.', name: 'Valentina G.', role: 'RRHH', initials: 'VG' },
]

function Stars() {
    return (
        <div className="flex gap-0.5" aria-label="5 de 5 estrellas">
        {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} viewBox="0 0 20 20" width="16" height="16" aria-hidden className="fill-current text-amber-500">
            <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 15.9l-5.2 2.6.99-5.78L1.58 7.62l5.82-.85L10 1.5z" />
            </svg>
        ))}
        </div>
    )
}

function QuoteMark() {
    return (
        <svg viewBox="0 0 48 48" width="28" height="28" aria-hidden className="fill-current text-blue-700/20">
        <path d="M17 10c-4.4 0-8 3.6-8 8v6c0 4.4 3.6 8 8 8h3v-8h-5v-2c0-2.2 1.8-4 4-4h1V10h-3zm21 0c-4.4 0-8 3.6-8 8v6c0 4.4 3.6 8 8 8h3v-8h-5v-2c0-2.2 1.8-4 4-4h1V10h-3z" />
        </svg>
    )
}

export default function Testimonials() {
    const [items, setItems] = useState<Testimonial[]>([])
    const [loading, setLoading] = useState(true)

    // Paginación por 3
    const PAGE_SIZE = 3
    const [page, setPage] = useState(0)

    // Carga desde API pública
    useEffect(() => {
        let alive = true
        ;(async () => {
            setLoading(true)
            try {
                const ts = Date.now()
                const r = await fetch(`/api/public/testimonials?ts=${ts}`, { cache: 'no-store' })
                const data = await r.json().catch(() => [])
                if (!alive) return
                    const arr = Array.isArray(data) ? data : []
                    setItems(arr.length ? arr : FALLBACK)
                    setPage(0) // reset por si venía en otra página
            } catch {
                if (!alive) return
                    setItems(FALLBACK)
                    setPage(0)
            } finally {
                if (alive) setLoading(false)
            }
        })()
        return () => { alive = false }
    }, [])

    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))

    // Asegura que la página siempre esté dentro de rango si cambia items
    useEffect(() => {
        setPage((p) => Math.min(p, totalPages - 1))
    }, [totalPages])

    const canPrev = page > 0
    const canNext = page < totalPages - 1

    const pageItems = useMemo(
        () => items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
                              [items, page]
    )

    return (
        <section className="mx-auto max-w-6xl px-4 py-16">
        <FadeIn>
        <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold text-slate-900">Qué dicen nuestros clientes</h2>
        <p className="mt-2 text-slate-600">Empresas y profesionales que ya capacitan con OreTec.</p>
        </div>
        </FadeIn>

        {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="card p-6 shadow-soft animate-pulse">
                <div className="h-4 w-24 rounded bg-slate-100" />
                <div className="mt-3 h-4 w-3/4 rounded bg-slate-100" />
                <div className="mt-2 h-4 w-1/2 rounded bg-slate-100" />
                <div className="mt-5 h-8 w-32 rounded bg-slate-100" />
                </div>
            ))}
            </div>
        ) : (
            <>
            {/* Tarjetas (3 por página) */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((t, i) => (
                <FadeIn key={t.id || `${page}-${i}`} delay={0.04 * (i + 1)}>
                <article className="card bg-white p-6 shadow-soft transition-all duration-300 hover:shadow-md h-full">
                <div className="flex items-center justify-between">
                <Stars />
                <QuoteMark />
                </div>
                <p className="mt-3 text-slate-700">"{t.quote}"</p>
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

            {/* Controles + bullets */}
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <div className="flex gap-2">
            <button
            type="button"
            onClick={() => canPrev && setPage((p) => Math.max(0, p - 1))}
            className={`btn-secondary ${!canPrev ? 'cursor-not-allowed opacity-40' : ''}`}
            disabled={!canPrev}
            aria-label="Ver testimonios anteriores"
            >
            ← Anterior
            </button>
            <button
            type="button"
            onClick={() => canNext && setPage((p) => Math.min(totalPages - 1, p + 1))}
            className={`btn-primary ${!canNext ? 'cursor-not-allowed opacity-40' : ''}`}
            disabled={!canNext}
            aria-label="Ver más testimonios"
            >
            Siguiente →
            </button>
            </div>

            {/* Bullets de página (clicables) */}
            <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => {
                const active = i === page
                return (
                    <button
                    key={i}
                    type="button"
                    aria-label={`Ir a la página ${i + 1}`}
                    onClick={() => setPage(i)}
                    className={`h-2.5 w-2.5 rounded-full transition ${
                        active ? 'bg-blue-700' : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                    />
                )
            })}
            </div>
            </div>
            </>
        )}
        </section>
    )
}
