'use client'

import { useRouter } from 'next/navigation'

type Props = {
    href?: string       // destino de respaldo (por defecto '/')
    label?: string      // texto del botón (por defecto '← Volver')
    className?: string  // clases extra si las necesitas
}

export default function BackButton({ href = '/', label = '← Volver', className = '' }: Props) {
    const router = useRouter()

    function goBack() {
        // Si hay historial, volvemos; si no, vamos a href
        if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back()
        } else {
            router.push(href)
        }
    }

    return (
        <button
        type="button"
        onClick={goBack}
        className={`btn-secondary ${className}`}
        aria-label="Volver"
        >
        {label}
        </button>
    )
}
