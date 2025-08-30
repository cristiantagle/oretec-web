// components/AnimatedStatsFancy.tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import FadeIn from '@/components/FadeIn'

function Counter({ to, suffix = '', duration = 900 }: { to: number; suffix?: string; duration?: number }) {
    const [val, setVal] = useState(0)
    const started = useRef(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return
            const obs = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && !started.current) {
                        started.current = true
                        const start = performance.now()
                        const from = 0
                        const tick = (t: number) => {
                            const p = Math.min((t - start) / duration, 1)
                            const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
                            setVal(Math.round(from + (to - from) * eased))
                            if (p < 1) requestAnimationFrame(tick)
                        }
                        requestAnimationFrame(tick)
                    }
                },
                { threshold: 0.35 }
            )
            obs.observe(el)
            return () => obs.disconnect()
    }, [to, duration])

    return (
        <div ref={ref} className="tabular-nums text-2xl font-semibold text-slate-900">
        {val.toLocaleString('es-CL')}{suffix}
        </div>
    )
}

const items = [
    { label: 'Alumnos certificados', value: 1200, suffix: '+' },
{ label: 'Cursos activos', value: 18, suffix: '' },
{ label: 'Satisfacción', value: 98, suffix: '%' },
{ label: 'Años de experiencia', value: 10, suffix: '+' },
]

export default function AnimatedStatsFancy() {
    return (
        <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
        <FadeIn>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
            <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm hover:shadow-md transition"
            >
            <Counter to={it.value} suffix={it.suffix} />
            <div className="mt-1 text-sm text-slate-600">{it.label}</div>
            </div>
        ))}
        </div>
        </FadeIn>
        </div>
        </section>
    )
}
