'use client'
import Image from 'next/image'

const items = [
    {
        title: '100% Online',
        desc: 'Accede desde cualquier dispositivo, en cualquier momento.',
        img: '/images/devices-responsive.png',
    },
{
    title: 'Certificación',
    desc: 'Certificado digital al finalizar tus evaluaciones.',
    img: '/images/certificate.png',
},
{
    title: 'Enfoque Chile',
    desc: 'Contenidos alineados a normativa y buenas prácticas locales.',
    img: '/images/icons-set-2.png',
},
]

export default function FeatureCards() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
            <div key={i} className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="mb-3 flex items-center gap-3">
            <div className="relative h-10 w-10">
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
