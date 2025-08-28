'use client'
import Link from 'next/link'

export default function CTASection() {
    return (
        <div id="contacto" className="rounded-3xl border bg-white/70 p-8 text-center shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">¿Necesitas cotizar para tu empresa?</h3>
        <p className="mt-2 text-slate-600">
        Diseñamos planes de formación para cumplir con normativa y metas internas.
        </p>
        <div className="mt-4 flex justify-center gap-3">
        <Link
        href="/courses"
        className="rounded-xl px-4 py-2 text-white"
        style={{ background: '#1E3A8A' }}
        >
        Ver catálogo
        </Link>
        <a
        href="mailto:contacto@oretec.cl"
        className="rounded-xl border px-4 py-2 text-[#1E3A8A]"
        style={{ borderColor: '#1E3A8A' }}
        >
        Escríbenos
        </a>
        </div>
        </div>
    )
}
