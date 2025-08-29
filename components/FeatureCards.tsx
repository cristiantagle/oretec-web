'use client'
import Image from 'next/image'

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
            <div
            key={i}
            className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md"
            >
            <div className="mb-4 flex items-center gap-4">
            <div className="relative h-16 w-16"> {/* íconos más grandes */}
            <Image src={it.img} alt="" fill className="object-contain" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{it.title}</h3>
            </div>
            <p className="text-slate-600">{it.desc}</p>
            </div>
        ))}
        </div>
    )
}
