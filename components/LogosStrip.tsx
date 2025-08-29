'use client'
import Image from 'next/image'

export default function LogosStrip() {
    const logos = [
        { src: '/images/icons/book.png', alt: 'Contenido e-learning' },
        { src: '/images/icons/monitor.png', alt: 'Compatibilidad dispositivos' },
        { src: '/images/icons/cap.png', alt: 'Certificación' },
        { src: '/images/icons/wifi.png', alt: '100% online' },
    ]
    return (
        <div className="rounded-2xl border bg-white/80 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-center gap-10 opacity-95">
        {logos.map((l, i) => (
            <div
            key={i}
            className="relative"
            style={{ width: 120, height: 56 }} // íconos más grandes
            aria-label={l.alt}
            role="img"
            title={l.alt}
            >
            <Image src={l.src} alt={l.alt} fill className="object-contain" />
            </div>
        ))}
        </div>
        </div>
    )
}
