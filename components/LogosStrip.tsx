'use client'
import Image from 'next/image'

export default function LogosStrip() {
    const logos = [
        { src: '/images/icons-set-1.png', alt: 'e-learning' },
        { src: '/images/icons-set-2.png', alt: 'capacitación' },
        { src: '/images/devices-responsive.png', alt: 'dispositivos' },
        { src: '/images/certificate.png', alt: 'certificación' },
    ]
    return (
        <div className="rounded-2xl border bg-white/70 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-90">
        {logos.map((l, i) => (
            <div key={i} className="relative h-10 w-32">
            <Image src={l.src} alt={l.alt} fill className="object-contain" />
            </div>
        ))}
        </div>
        </div>
    )
}
