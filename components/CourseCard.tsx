'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'

type Props = {
    title: string
    code?: string | null
    hours?: number | null
    priceCLP?: number | null
    href?: string | null
    description?: string | null
    /** Opcional: links por cantidad (1,5,10 → URL de Mercado Pago) */
    mpLinksByQty?: Record<number, string>
}

export default function CourseCard({
    title,
    code = null,
    hours = null,
    priceCLP = null,
    href = null,
    description = null,
    mpLinksByQty,
}: Props) {
    const clp = (n: number) =>
    (n || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

    // cantidades disponibles ordenadas (si vienen)
    const qtyOptions = useMemo(() => {
        if (!mpLinksByQty) return []
            return Object.keys(mpLinksByQty)
            .map((k) => parseInt(k, 10))
            .filter((n) => Number.isFinite(n) && n > 0)
            .sort((a, b) => a - b)
    }, [mpLinksByQty])

    const [qty, setQty] = useState<number>(() => (qtyOptions[0] ?? 1))
    const linkForQty = mpLinksByQty ? mpLinksByQty[qty] : null
    const finalHref = linkForQty || href || null

    return (
        <article className="group card card-hover flex flex-col p-5">
        <header>
        {code && <div className="mb-2 text-[11px] uppercase tracking-wide text-slate-500">{code}</div>}
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {description && <p className="mt-1 line-clamp-3 text-sm text-slate-600">{description}</p>}
        </header>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        {typeof hours === 'number' && hours > 0 && <span className="chip">⏱ {hours} h</span>}
        {typeof priceCLP === 'number' && priceCLP > 0 && <span className="chip">💵 {clp(priceCLP)}</span>}
        </div>

        {/* Selector de cantidad SOLO si hay links por cantidad */}
        {qtyOptions.length > 0 && (
            <div className="mt-4">
            <label className="text-sm text-slate-600">Participantes</label>
            <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value, 10))}
            >
            {qtyOptions.map((q) => (
                <option key={q} value={q}>
                {q} {q === 1 ? 'participante' : 'participantes'}
                </option>
            ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
            * Si necesitas otra cantidad, contáctanos y te habilitamos el link.
            </p>
            </div>
        )}

        <div className="mt-auto pt-5">
        {finalHref ? (
            <a
            href={finalHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full text-center"
            title={`Pagar ${title} en Mercado Pago`}
            >
            Comprar ahora
            </a>
        ) : (
            <span className="btn-secondary w-full cursor-not-allowed opacity-60 text-center">Próximamente</span>
        )}
        </div>
        </article>
    )
}
