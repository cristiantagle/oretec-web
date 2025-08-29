// components/ScrollTop.tsx
'use client'
import { useEffect, useState } from 'react'

export default function ScrollTop() {
    const [show, setShow] = useState(false)

    useEffect(() => {
        const onScroll = () => setShow(window.scrollY > 400)
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    if (!show) return null

        return (
            <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-5 right-5 z-50 rounded-full border border-blue-700 bg-white px-3 py-2 text-sm font-medium text-blue-700 shadow-md transition hover:scale-105 hover:bg-blue-50 active:scale-95"
            aria-label="Volver arriba"
            title="Volver arriba"
            >
            ↑
            </button>
        )
}
