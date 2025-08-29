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
        <article className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md">
        {/* Código + título */}
        <header>
        {code && (
            <div className="mb-2 text-[11px] uppercase tracking-wide text-slate-500">
            {code}
            </div>
        )}
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {description && (
            <p className="mt-1 line-clamp-3 text-sm text-slate-600">
            {description}
            </p>
        )}
        </header>

        {/* Chips bonitas (horas y precio) */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
        {typeof hours === 'number' && hours > 0 && (
            <span className="chip">⏱ {hours} h</span>
        )}
        {typeof priceCLP === 'number' && priceCLP > 0 && (
            <span className="chip">💵 {clp(priceCLP)}</span>
        )}
        </div>

        {/* Botón con hover moderno, manteniendo azul corporativo */}
        <div className="mt-auto pt-5">
        {href ? (
            <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            >
            Comprar ahora
            </Link>
        ) : (
            <span className="block rounded-xl bg-gray-200 px-4 py-2 text-center text-sm text-gray-600">
            Próximamente
            </span>
        )}
        </div>
        </article>
    )
}
