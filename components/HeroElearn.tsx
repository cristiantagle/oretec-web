'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function HeroElearn() {
    const [hover, setHover] = useState(false)
    return (
        <header className="relative overflow-hidden">
        {/* fondo con degradés */}
        <div className="absolute inset-0 -z-10 bg-oret-gradient" />
        <div
        className="absolute -top-24 -right-24 h-[420px] w-[420px] rounded-full blur-3xl opacity-20"
        style={{ background: 'radial-gradient(600px 200px at 50% 50%, #2563EB22, transparent)' }}
        />
        <div
        className="absolute -bottom-24 -left-24 h-[420px] w-[420px] rounded-full blur-3xl opacity-20"
        style={{ background: 'radial-gradient(600px 200px at 50% 50%, #1E3A8A22, transparent)' }}
        />

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-20">
        <div>
        <h1
        className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl"
        style={{ fontFamily: 'var(--font-display)' }}
        >
        Capacitación <span className="text-[#1E3A8A]">e-learning</span> en
        <br />prevención y seguridad laboral
        </h1>
        <p className="mt-4 max-w-xl text-slate-700">
        Cursos online, prácticos y actualizados. Certifícate desde cualquier lugar y avanza en tu cumplimiento normativo.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
        <Link
        href="/courses"
        className="rounded-xl px-5 py-3 text-white transition"
        style={{ background: '#1E3A8A' }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        >
        Ver catálogo de cursos
        </Link>
        <Link
        href="#contacto"
        className="rounded-xl border px-5 py-3 text-[#1E3A8A]"
        style={{ borderColor: '#1E3A8A' }}
        >
        Asesoría para empresas
        </Link>
        </div>

        <ul className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600">
        <li>• 100% online</li>
        <li>• Certificación digital</li>
        <li>• Enfoque Chile</li>
        </ul>
        </div>

        <div className="relative h-[280px] w-full md:h-[340px]">
        <div className="absolute inset-0 rounded-3xl bg-white/70 shadow-lg backdrop-blur">
        <Image
        src="/images/hero-elearning.png"
        alt="Capacitación e-learning"
        fill
        priority
        className="rounded-3xl object-cover"
        />
        </div>
        {/* plaquitas */}
        <div className="absolute -bottom-4 -left-4 rounded-2xl border bg-white px-4 py-3 text-sm shadow-md">
        <div className="font-medium text-slate-800">Cursos activos</div>
        <div className="text-slate-600">Catálogo actualizado — CLP</div>
        </div>
        <div className="absolute -top-4 -right-4 rounded-2xl border bg-white px-4 py-3 text-sm shadow-md">
        <div className="font-medium text-slate-800">Certificación</div>
        <div className="text-slate-600">Descarga inmediata</div>
        </div>
        </div>
        </div>
        </header>
    )
}
