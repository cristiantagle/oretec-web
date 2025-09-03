'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function HeroClassic() {
    return (
        <section className="relative">
        {/* fondo suave */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-white to-blue-50" />

        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-10 md:grid-cols-2 md:py-16">
        {/* texto */}
        <div>
        <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
        Capacitación e-learning en{' '}
        <span className="text-blue-900">prevención y seguridad laboral</span>
        </h1>
        <p className="mt-3 text-base text-slate-700">
        Cursos online con certificación, pensados para empresas y particulares.
        Aprende a tu ritmo, desde cualquier dispositivo.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
        <Link href="/courses" className="btn-primary">Ver cursos</Link>
        <Link href="/contact" className="btn-secondary">Cotizar para empresa</Link>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-600">
        <span className="chip">100% online</span>
        <span className="chip">Certificados</span>
        <span className="chip">Facturación empresa</span>
        </div>
        </div>

        {/* imagen responsiva con overlay sutil */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-soft">
        {/* ajuste de aspecto para móvil */}
        <div className="relative aspect-[16/11] w-full">
        <Image
        src="/images/hero-oretec@2x.jpg" // pon aquí tu imagen grande (2x)
    alt="Capacitación e-learning en prevención y seguridad laboral"
    fill
    sizes="(max-width: 768px) 100vw, 600px"
    className="object-cover"
    priority
    />
    {/* velo sutil para que el color no sature en pantallas chicas */}
    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-blue-50/30" />
    </div>
    </div>
    </div>
    </section>
    )
}
