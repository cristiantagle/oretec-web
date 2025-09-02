'use client'
import Image from 'next/image'
import Link from 'next/link'
import FadeIn from '@/components/FadeIn'

export default function HeroElearn() {
    return (
        <header className="relative bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-20">
        {/* Texto */}
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
        Cursos online, prácticos y actualizados. Certifícate desde cualquier lugar y avanza en tu
        cumplimiento normativo.
        </p>
        </FadeIn>

        {/* CTAs principales */}
        <FadeIn delay={0.1}>
        <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/courses" className="btn-primary">Ver catálogo de cursos</Link>
        <Link href="#contacto" className="btn-secondary">Asesoría para empresas</Link>
        </div>
        </FadeIn>

        {/* Micro-barra de acceso */}
        <FadeIn delay={0.18}>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-soft">
        {/* Fila superior */}
        <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-slate-700">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="link-anim">Ingresar</Link>
        </span>
        <span className="text-sm text-slate-700">
        ¿Nuevo aquí?{' '}
        <Link href="/register" className="link-anim">Crear cuenta</Link>
        </span>
        </div>

        {/* Fila inferior centrada con iconos */}
        <div className="mt-4 flex justify-center gap-3">
        <Link
        href="/register?type=individual"
        className="btn-secondary !px-3 !py-1.5 text-sm flex items-center gap-2 hover:bg-blue-50 hover:text-blue-700"
        >
        <span className="text-lg">👤</span>
        Particular
        </Link>
        <Link
        href="/register?type=company"
        className="btn-secondary !px-3 !py-1.5 text-sm flex items-center gap-2 hover:bg-emerald-50 hover:text-emerald-700"
        >
        <span className="text-lg">🏢</span>
        Empresa
        </Link>
        </div>
        </div>
        </FadeIn>

        <FadeIn delay={0.22}>
        <ul className="mt-6 flex flex-wrap gap-4 text-sm text-slate-700">
        <li>• 100% online</li>
        <li>• Certificación digital</li>
        <li>• Enfoque Chile</li>
        </ul>
        </FadeIn>
        </div>

        {/* Imagen */}
        <FadeIn delay={0.2}>
        <div className="relative h-[280px] w-full md:h-[340px]">
        <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl shadow-soft">
        <Image
        src="/images/hero-elearning.png?v=2"
        alt="Capacitación e-learning"
        fill
        priority
        sizes="(min-width: 768px) 520px, 100vw"
        className="rounded-3xl object-cover object-center"
        />
        <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{
            background:
            'linear-gradient(135deg, rgba(30,58,138,0.18) 0%, rgba(255,255,255,0.0) 55%, rgba(30,58,138,0.10) 100%)',
        }}
        />
        </div>

        <div
        className="pointer-events-none absolute -inset-[1px] rounded-[26px]"
        style={{ boxShadow: '0 0 0 1px rgba(30,58,138,0.08)' }}
        />

        <FadeIn delay={0.28}>
        <div className="card absolute left-3 top-3 z-10 px-3 py-2 text-xs sm:left-4 sm:top-4 sm:px-4 sm:py-3 sm:text-sm">
        <div className="font-medium text-slate-800">Cursos activos</div>
        <div className="text-slate-600">Catálogo actualizado — CLP</div>
        </div>
        </FadeIn>

        <FadeIn delay={0.33}>
        <div className="card absolute bottom-3 right-3 z-10 px-3 py-2 text-xs sm:bottom-4 sm:right-4 sm:px-4 sm:py-3 sm:text-sm">
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
