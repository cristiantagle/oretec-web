'use client'
import Link from 'next/link'
import FadeIn from '@/components/FadeIn'

export default function CTASection() {
    return (
        <FadeIn>
        <div
        id="contacto"
        className="card p-8 text-center shadow-sm transition hover:shadow-md hover:scale-[1.02]"
        >
        <h3 className="text-xl font-semibold text-slate-900">
        ¿Necesitas cotizar para tu empresa?
        </h3>
        <p className="mt-2 text-slate-600">
        Diseñamos planes de formación para cumplir con normativa y metas internas.
        </p>
        <div className="mt-4 flex justify-center gap-3">
        <Link href="/courses" className="btn-primary">
        Ver catálogo
        </Link>
        <a href="mailto:contacto@oretec.cl" className="btn-secondary">
        Escríbenos
        </a>
        </div>
        </div>
        </FadeIn>
    )
}
