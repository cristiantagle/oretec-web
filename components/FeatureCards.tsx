'use client'
import Image from 'next/image'
import FadeIn from '@/components/FadeIn'

const items = [
    {
        title: '100% Online',
        desc: 'Accede desde cualquier dispositivo, en cualquier momento.',
        img: '/images/icons/wifi.png',
    },
{
    title: 'Certificación',
    desc: 'Certificado digital al finalizar tus evaluaciones.',
    img: '/images/icons/cap.png',
},
{
    title: 'Compatibilidad',
    desc: 'Funciona en computador, tablet y móvil sin instalaciones.',
    img: '/images/icons/monitor.png',
},
{
    title: 'Aprendizaje Moderno',
    desc: 'Recursos interactivos y material actualizado.',
    img: '/images/icons/book.png',
},
]

export default function FeatureCards() {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
            <FadeIn key={it.title} delay={i * 0.06}>
            <div className="card group rounded-2xl p-6 shadow-sm transition hover:shadow-md hover:scale-[1.02]">
            <div className="mb-4 flex items-center gap-4">
            <div className="relative h-18 w-18 sm:h-16 sm:w-16">
            <Image
            src={it.img}
            alt=""
            fill
            className="object-contain"
            sizes="64px"
            priority={i < 2}
            />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{it.title}</h3>
            </div>
            <p className="text-slate-600">{it.desc}</p>
            </div>
            </FadeIn>
        ))}
        </div>
    )
}
