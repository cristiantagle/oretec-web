// components/StatsBand.tsx
'use client'
import { useEffect, useState } from 'react'

type Stat = { label: string; value: number; suffix?: string }

const STATS: Stat[] = [
    { label: 'Alumnos Capacitados', value: 1200, suffix: '+' },
{ label: 'Horas de Contenido', value: 80, suffix: ' h' },
{ label: 'Cursos Disponibles', value: 12, suffix: '+' },
]

function useCountUp(target: number, durationMs = 900) {
    const [n, setN] = useState(0)
    useEffect(() => {
        let raf = 0
        const start = performance.now()
        const tick = (t: number) => {
            const p = Math.min(1, (t - start) / durationMs)
            const eased = 1 - Math.pow(1 - p, 3)
            setN(Math.round(target * eased))
            if (p < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [target, durationMs])
    return n
}

export default function StatsBand() {
    return (
        <section className="border-y bg-white/60">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-10 sm:grid-cols-3">
        {STATS.map((s, i) => {
            const value = useCountUp(s.value, 800 + i * 150)
            return (
                <div
                key={s.label}
                className="rounded-2xl border bg-white p-6 text-center shadow-sm transition hover:shadow-md"
                >
                <div className="text-3xl font-semibold text-slate-900">
                {value}
                {s.suffix || ''}
                </div>
                <div className="mt-1 text-sm text-slate-600">{s.label}</div>
                </div>
            )
        })}
        </div>
        </section>
    )
}
