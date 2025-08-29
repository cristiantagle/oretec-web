// components/Testimonials.tsx
'use client'
import FadeIn from '@/components/FadeIn'

type Testimonial = {
    quote: string
    name: string
    role: string
    initials: string
}

const items: Testimonial[] = [
    {
        quote:
        'Contenido claro y práctico. El proceso de certificación fue muy rápido.',
        name: 'María P.',
        role: 'Encargada de Prevención',
        initials: 'MP',
    },
{
    quote:
    'Ideal para capacitar turnos. 100% online y con soporte excelente.',
    name: 'Carlos R.',
    role: 'Jefe de Operaciones',
    initials: 'CR',
},
{
    quote:
    'Cumplimos la normativa sin interrumpir la producción. Recomendado.',
    name: 'Valentina G.',
    role: 'RRHH',
    initials: 'VG',
},
]

function Stars() {
    return (
        <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} viewBox="0 0 20 20" width="16" height="16" aria-hidden className="text-amber-500 fill-current">
            <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 15.9l-5.2 2.6.99-5.78L1.58 7.62l5.82-.85L10 1.5z"/>
            </svg>
        ))}
        </div>
    )
}

export default function Testimonials() {
    return (
        <section className="mx-auto max-w-6xl px-4 py-16">
        <FadeIn>
        <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold text-slate-900">Qué dicen nuestros clientes</h2>
        <p className="mt-2 text-slate-600">
        Empresas y profesionales que ya capacitan con OreTec.
        </p>
        </div>
        </FadeIn>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t, i) => (
            <FadeIn key={i} delay={0.04 * (i + 1)}>
            <article className="card shadow-soft hover:shadow-md transition rounded-2xl bg-white p-6 h-full">
            <Stars />
            <p className="mt-3 text-slate-700">“{t.quote}”</p>

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
        </section>
    )
}
