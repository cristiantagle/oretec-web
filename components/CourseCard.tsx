"use client"
import Link from 'next/link'
import BuyNowMP from '@/components/BuyNowMP'

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

    const hasPrice = typeof priceCLP === 'number' && priceCLP > 0
    const hasLink = typeof href === 'string' && href.length > 0

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
        {hasPrice && <span className="chip">💵 {clp(priceCLP!)}</span>}
        </div>

        <div className="mt-auto pt-5">
        {hasLink ? (
            <Link
            href={href!}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full"
            >
            Comprar ahora
            </Link>
        ) : hasPrice ? (
            <BuyNowMP
            title={title}
            unitPriceCLP={priceCLP!}
            courseCode={code ?? undefined}
            label="Comprar ahora"
            className="btn-primary w-full"
            />
        ) : (
            <span className="btn-secondary w-full cursor-not-allowed opacity-60">
            Próximamente
            </span>
        )}
        </div>
        </article>
    )
}
