// components/HeroElearn.tsx
'use client'
import Image from 'next/image'
import Link from 'next/link'
import FadeIn from '@/components/FadeIn'

export default function HeroElearn() {
    return (
        <header className="relative bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-20">
        {/* Lado texto */}
        <div>
        <FadeIn>
        <h1
        className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl"
        style={{ fontFamily: 'var(--font-display)' }}
        >
        Capacitación <span className="text-[#1E3A8A]">e-learning</span> en
        <br />
        prevención y seguridad laboral
        </h1>
        </FadeIn>

        <FadeIn delay={0.05}>
        <p className="mt-4 max-w-xl text-slate-800">
        Cursos online, prácticos y actualizados. Certifícate desde cualquier lugar y avanza en tu cumplimiento
        normativo.
        </p>
        </FadeIn>

        <FadeIn delay={0.1}>
        <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/courses" className="btn-primary">
        Ver catálogo de cursos
        </Link>
        <Link href="#contacto" className="btn-secondary">
        Asesoría para empresas
        </Link>
        </div>
        </FadeIn>

        <FadeIn delay={0.15}>
        <ul className="mt-6 flex flex-wrap gap-4 text-sm text-slate-700">
        <li>• 100% online</li>
        <li>• Certificación digital</li>
        <li>• Enfoque Chile</li>
        </ul>
        </FadeIn>
        </div>

        {/* Lado imagen */}
        <FadeIn delay={0.2}>
        <div className="relative h-[280px] w-full md:h-[340px]">
        {/* Imagen */}
        <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl shadow-soft">
        <Image
        src="/images/hero-elearning.png?v=2"
        alt="Capacitación e-learning"
        fill
        priority
        sizes="(min-width: 768px) 520px, 100vw"
        className="rounded-3xl object-cover object-center"
        />
        {/* Overlay degradado sutil para mejorar contraste del texto/chapas */}
        <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{
            background:
            'linear-gradient(135deg, rgba(30,58,138,0.18) 0%, rgba(255,255,255,0.0) 55%, rgba(30,58,138,0.10) 100%)',
        }}
        />
        </div>

        {/* Halo muy sutil alrededor (acorde al sistema visual) */}
        <div className="pointer-events-none absolute -inset-[1px] rounded-[26px]" style={{ boxShadow: '0 0 0 1px rgba(30,58,138,0.08)' }} />

        {/* Chips */}
        <FadeIn delay={0.25}>
        <div className="card absolute -bottom-4 -left-4 z-10 px-4 py-3 text-sm">
        <div className="font-medium text-slate-800">Cursos activos</div>
        <div className="text-slate-600">Catálogo actualizado — CLP</div>
        </div>
        </FadeIn>

        <FadeIn delay={0.3}>
        <div className="card absolute -top-4 -right-4 z-10 px-4 py-3 text-sm">
        <div className="font-medium text-slate-800">Certificación</div>
        <div className="text-slate-600">Descarga inmediata</div>
        </div>
        </FadeIn>
        </div>
        </FadeIn>
        </div>
        </header>
    )
}

