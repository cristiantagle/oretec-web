'use client'
import Image from 'next/image'
import Link from 'next/link'

export default function HeroElearn() {
    return (
        <header className="relative bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-20">
        <div>
        <h1
        className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl"
        style={{ fontFamily: 'var(--font-display)' }}
        >
        Capacitación <span className="text-[#1E3A8A]">e-learning</span> en
        <br />prevención y seguridad laboral
        </h1>

        <p className="mt-4 max-w-xl text-slate-800">
        Cursos online, prácticos y actualizados. Certifícate desde cualquier lugar y avanza en tu cumplimiento normativo.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/courses" className="rounded-xl px-5 py-3 text-white" style={{ background: '#1E3A8A' }}>
        Ver catálogo de cursos
        </Link>
        <Link href="#contacto" className="rounded-xl border px-5 py-3 text-[#1E3A8A]" style={{ borderColor: '#1E3A8A' }}>
        Asesoría para empresas
        </Link>
        </div>

        <ul className="mt-6 flex flex-wrap gap-4 text-sm text-slate-700">
        <li>• 100% online</li>
        <li>• Certificación digital</li>
        <li>• Enfoque Chile</li>
        </ul>
        </div>

        {/* Contenedor de imagen con capas controladas */}
        <div className="relative h-[280px] w-full md:h-[340px]">
        {/* Imagen principal (cache-bust v=2) */}
        <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl shadow-soft">
        <Image
        src="/images/hero-elearning.png?v=2"
        alt="Capacitación e-learning"
        fill
        priority
        sizes="(min-width: 768px) 520px, 100vw"
        className="rounded-3xl object-cover object-center"
        />
        </div>

        {/* Chips arriba de la imagen */}
        <div className="card absolute -bottom-4 -left-4 z-10 px-4 py-3 text-sm">
        <div className="font-medium text-slate-800">Cursos activos</div>
        <div className="text-slate-600">Catálogo actualizado — CLP</div>
        </div>

        <div className="card absolute -top-4 -right-4 z-10 px-4 py-3 text-sm">
        <div className="font-medium text-slate-800">Certificación</div>
        <div className="text-slate-600">Descarga inmediata</div>
        </div>
        </div>
        </div>
        </header>
    )
}
