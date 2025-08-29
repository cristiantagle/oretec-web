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
        <article className="group card card-hover p-5">
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

        {/* Chips (horas y precio) */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
        {typeof hours === 'number' && hours > 0 && (
            <span className="chip">⏱ {hours} h</span>
        )}
        {typeof priceCLP === 'number' && priceCLP > 0 && (
            <span className="chip">💵 {clp(priceCLP)}</span>
        )}
        </div>

        {/* Botón con hover corporativo */}
        <div className="mt-auto pt-5">
        {href ? (
            <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full"
            >
            Comprar ahora
            </Link>
        ) : (
            <span className="btn-secondary w-full cursor-not-allowed opacity-60">
            Próximamente
            </span>
        )}
        </div>
        </article>
    )
}
