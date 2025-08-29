'use client'
import Link from 'next/link'

type Props = {
    title: string
    code?: string | null
    hours?: number | null
    priceCLP?: number | null
    href?: string | null
    description?: string | null
}

export default function CourseCard({
    title,
    code = null,
    hours = null,
    priceCLP = null,
    href = null,
    description = null,
}: Props) {
    const clp = (n: number) =>
    (n || 0).toLocaleString('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
    })

    return (
        <article className="group rounded-2xl border border-slate-200 bg-white p-5 transition duration-150 hover:shadow-soft">
        <header>
        {code && (
            <div className="mb-2 text-[11px] uppercase tracking-wide text-slate-500">{code}</div>
        )}
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {description && (
            <p className="mt-1 line-clamp-3 text-sm text-slate-600">{description}</p>
        )}
        </header>

        <div className="mt-4 flex flex-wrap items-center gap-2">
        {typeof hours === 'number' && hours > 0 && (
            <span className="chip">⏱ {hours} h</span>
        )}
        {typeof priceCLP === 'number' && priceCLP > 0 && (
            <span className="chip">💵 {clp(priceCLP)}</span>
        )}
        </div>

        <footer className="mt-5">
        {href ? (
            <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-xl px-4 py-2 text-white transition"
            style={{ background: '#1E3A8A' }}  // ← fuerza azul corporativo
            >
            Comprar ahora
            </a>
        ) : (
            <span className="text-sm text-slate-500">Próximamente</span>
        )}
        </footer>
        </article>
    )
}
