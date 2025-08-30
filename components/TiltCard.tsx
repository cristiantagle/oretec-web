// components/TiltCard.tsx
'use client'
import { useRef } from 'react'

export default function TiltCard({
    children,
    maxTilt = 6,
    className = '',
}: {
    children: React.ReactNode
    maxTilt?: number
    className?: string
}) {
    const ref = useRef<HTMLDivElement>(null)

    function onMove(e: React.MouseEvent) {
        const el = ref.current
        if (!el) return
            const rect = el.getBoundingClientRect()
            const px = (e.clientX - rect.left) / rect.width
            const py = (e.clientY - rect.top) / rect.height
            const rx = (py - 0.5) * -2 * maxTilt
            const ry = (px - 0.5) *  2 * maxTilt
            el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`
    }
    function onLeave() {
        const el = ref.current
        if (!el) return
            el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0)'
    }

    return (
        <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className={`transition-transform duration-200 will-change-transform ${className}`}
        style={{ transformStyle: 'preserve-3d' }}
        >
        {children}
        </div>
    )
}
