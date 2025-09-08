"use client"
import Image from 'next/image'

const items = [
    {
        src: '/images/icons/icon-book.png?v=2',
        alt: 'Contenido actualizado',
        title: 'Contenido actualizado',
        text: 'Programas alineados al marco normativo vigente.',
    },
{
    src: '/images/icons/icon-bookmark.png?v=2',
    alt: 'Certificación digital',
    title: 'Certificación digital',
    text: 'Descarga inmediata al aprobar tu curso.',
},
{
    src: '/images/icons/icon-graduation.png?v=2',
    alt: 'E-learning OreTec',
    title: 'E-learning OreTec',
    text: 'Metodología práctica y flexible.',
},
{
    src: '/images/icons/icon-wifi.png?v=2',
    alt: '100% online',
    title: '100% online',
    text: 'Accede desde cualquier lugar.',
},
]

export default function HomeBenefits() {
    return (
        <section className="bg-white py-10">
        <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-3xl border bg-white/90 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
            <div key={it.title} className="flex items-start gap-4">
            <div className="shrink-0 rounded-2xl bg-[#EEF3FF] p-3">
            <Image
            src={it.src}
            alt={it.alt}
            width={40}
            height={40}
            className="block"
            loading="lazy"
            />
            </div>
            <div>
            <div className="font-medium text-slate-900">{it.title}</div>
            <div className="text-sm text-slate-600">{it.text}</div>
            </div>
            </div>
        ))}
        </div>
        </div>
        </div>
        </section>
    )
}
