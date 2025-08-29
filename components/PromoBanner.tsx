// components/PromoBanner.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const LS_KEY = 'promoBannerDismissed:v1'

export default function PromoBanner() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (typeof window === 'undefined') return
            const dismissed = localStorage.getItem(LS_KEY)
            if (!dismissed) setVisible(true)
    }, [])

    function dismiss() {
        setVisible(false)
        try { localStorage.setItem(LS_KEY, '1') } catch {}
    }

    if (!visible) return null

        return (
            <div className="border-b bg-[#F7FAFF]">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
            <p className="text-sm text-slate-700">
            🎉 <strong className="text-slate-900">Nuevo</strong>: cursos en promoción por lanzamiento.
            </p>
            <div className="flex items-center gap-2">
            <Link href="/courses" className="btn-primary px-3 py-1.5 text-xs">Ver catálogo</Link>
            <button
            onClick={dismiss}
            aria-label="Cerrar promoción"
            className="rounded-md border px-2 py-1 text-xs text-slate-600 hover:bg-white"
            >
            Cerrar
            </button>
            </div>
            </div>
            </div>
        )
}
