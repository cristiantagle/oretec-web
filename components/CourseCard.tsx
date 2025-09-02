'use client'
import Link from 'next/link'

type Props = {
    title: string
    code?: string | null
    hours?: number | null
    priceCLP?: number | null
    href?: string | null | undefined   // puede venir vacío o undefined
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
    // Normaliza CLP
    const clp = (n: number) =>
    (n || 0).toLocaleString('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
    })

    // 👇 Normaliza href: si viene '', '  ', undefined ⇒ null
    const safeHref: string | null =
    typeof href === 'string' && href.trim().length > 0 ? href : null

    return (
        <article className="group card card-hover p-5">
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

        <div className="mt-4 flex flex-wrap items-center gap-2">
        {typeof hours === 'number' && hours > 0 && (
            <span className="chip">⏱ {hours} h</span>
        )}
        {typeof priceCLP === 'number' && priceCLP > 0 && (
            <span className="chip">💵 {clp(priceCLP)}</span>
        )}
        </div>

        <div className="mt-auto pt-5">
        {safeHref ? (
            <Link
            href={safeHref}
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
