// components/CourseCard.tsx
'use client'

import Link from 'next/link'

type Props = {
    title: string
    code?: string | null
    description?: string | null
    hours?: number | null
    priceCLP?: number | null
    href?: string | null
}

export default function CourseCard({
    title,
    code,
    description,
    hours,
    priceCLP,
    href,
}: Props) {
    const clp = (n: number) =>
    (n || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col">
        <div className="text-xs text-slate-500 mb-1">{code || '—'}</div>
        <h2 className="text-lg font-semibold mb-2">{title}</h2>

        <div className="flex items-center gap-3 text-sm text-slate-700 mb-3">
        {typeof priceCLP === 'number' && <span className="font-medium">{clp(priceCLP)}</span>}
        {typeof hours === 'number' && <span className="text-slate-500">{hours} horas</span>}
        </div>

        {description && (
            <p className="text-sm text-slate-600 line-clamp-3 mb-4">{description}</p>
        )}

        <div className="mt-auto">
        {href ? (
            <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 rounded-xl text-white"
            style={{ background: '#1E3A8A' }}
            >
            Matricularme
            </a>
        ) : (
            <button
            className="inline-block px-4 py-2 rounded-xl border text-slate-500 cursor-not-allowed"
            style={{ borderColor: '#cbd5e1' }}
            disabled
            title="Este curso aún no tiene enlace de pago configurado"
            >
            Sin enlace de pago
            </button>
        )}
        </div>
        </article>
    )
}
