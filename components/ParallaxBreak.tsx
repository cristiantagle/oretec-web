// components/ParallaxBreak.tsx
'use client'
import { useEffect, useRef } from 'react'

type Props = {
    image?: string // ruta en /public/images/...
    height?: number // px
    strength?: number // 0..1
    caption?: string
}

export default function ParallaxBreak({
    image = '/images/hero-elearning.png',
    height = 240,
    strength = 0.2,
    caption = 'Aprende a tu ritmo — 100% online',
}: Props) {
    const ref = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return
            const onScroll = () => {
                const rect = el.getBoundingClientRect()
                const scrolled = (window.innerHeight - rect.top) * strength
                el.style.backgroundPosition = `center ${Math.round(scrolled)}px`
            }
            onScroll()
            window.addEventListener('scroll', onScroll, { passive: true })
            return () => window.removeEventListener('scroll', onScroll)
    }, [strength])

    return (
        <section
        ref={ref}
        className="my-10 w-full rounded-3xl border shadow-soft"
        style={{
            height,
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 0px',
        }}
        aria-label="Separador visual"
        >
        <div className="flex h-full w-full items-center justify-center rounded-3xl bg-white/20 backdrop-blur-[1px]">
        <span className="rounded-full bg-white/80 px-4 py-1 text-sm text-slate-700">
        {caption}
        </span>
        </div>
        </section>
    )
}
