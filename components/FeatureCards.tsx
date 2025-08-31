'use client'
import Image from 'next/image'
import FadeIn from '@/components/FadeIn'

const items = [
    { title: '100% Online', desc: 'Accede desde cualquier dispositivo, en cualquier momento.', img: '/images/icons/wifi.png' },
{ title: 'Certificación', desc: 'Certificado digital al finalizar tus evaluaciones.', img: '/images/icons/cap.png' },
{ title: 'Compatibilidad', desc: 'Funciona en computador, tablet y móvil sin instalaciones.', img: '/images/icons/monitor.png' },
{ title: 'Aprendizaje Moderno', desc: 'Recursos interactivos y material actualizado.', img: '/images/icons/book.png' },
]

export default function FeatureCards() {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
            <FadeIn key={it.title} delay={i * 0.06}>
            <div
            className="card group relative rounded-2xl p-6 shadow-sm transition
            hover:shadow-lg hover:scale-[1.03] hover:border-blue-500"
            >
            {/* Glow en el borde */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none bg-gradient-to-r from-blue-600/10 via-blue-400/10 to-blue-600/10" />

            <div className="relative mb-4 flex items-center gap-4">
            <div
            className="relative h-16 w-16 flex items-center justify-center rounded-xl bg-blue-50
            transition group-hover:bg-blue-100 group-hover:scale-110"
            >
            <Image src={it.img} alt="" fill className="object-contain" sizes="64px" priority={i < 2} />
            </div>
            <h3
            className="text-lg font-semibold text-slate-900 relative inline-block after:absolute
            after:left-0 after:bottom-[-2px] after:h-[2px] after:w-0 after:bg-blue-700
            after:transition-all after:duration-300 group-hover:after:w-full"
            >
            {it.title}
            </h3>
            </div>

            <p className="relative text-slate-600">{it.desc}</p>
            </div>
            </FadeIn>
        ))}
        </div>
    )
}
