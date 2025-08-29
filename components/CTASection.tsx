'use client'
import Link from 'next/link'

export default function CTASection() {
    return (
        <div
        id="contacto"
        className="card shadow-soft p-8 text-center transform transition
        hover:shadow-md hover:-translate-y-0.5"
        >
        <h3 className="text-xl font-semibold text-slate-900">
        ¿Necesitas cotizar para tu empresa?
        </h3>
        <p className="mt-2 text-slate-600">
        Diseñamos planes de formación para cumplir con normativa y metas internas.
        </p>
        <div className="mt-5 flex justify-center gap-3">
        <Link href="/courses" className="btn-primary">
        Ver catálogo
        </Link>
        <a href="mailto:contacto@oretec.cl" className="btn-secondary">
        Escríbenos
        </a>
        </div>
        </div>
    )
}
