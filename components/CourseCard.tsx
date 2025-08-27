import Link from 'next/link'

export default function CourseCard({
    title,
    code,
    hours,
    priceCLP,
    href,
}: {
    title: string
    code?: string | null
    hours?: number | null
    priceCLP?: number | null
    href?: string
}) {
    const clp = (n?: number | null) =>
    (n || 0).toLocaleString('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
    })

    return (
        <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:shadow-md">
        <div className="text-sm text-slate-500">{code || 'Curso'}</div>
        <h3 className="mt-1 text-lg font-semibold text-slate-900 group-hover:underline">{title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
        {typeof hours === 'number' && <span>⏱ {hours} horas</span>}
        {typeof priceCLP === 'number' && <span>💳 {clp(priceCLP)}</span>}
        </div>
        {href && (
            <Link
            href={href}
            className="mt-4 inline-block rounded-xl bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
            >
            Matricularme
            </Link>
        )}
        </div>
    )
}
