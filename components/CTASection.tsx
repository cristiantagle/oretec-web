'use client'
import Link from 'next/link'

export default function CTASection() {
    return (
        <div
        id="contacto"
        className="group rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm transition duration-300 hover:shadow-md md:p-12"
        >
        <h3 className="text-2xl font-semibold text-slate-900">
        ¿Necesitas cotizar para tu empresa?
        </h3>
        <p className="mt-2 max-w-2xl mx-auto text-slate-700">
        Diseñamos planes de formación para cumplir con normativa y metas internas.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
        href="/courses"
        className="btn-primary px-6 py-3 transform transition duration-300 ease-in-out hover:scale-105 active:scale-95"
        >
        Ver catálogo
        </Link>
        <a
        href="mailto:contacto@oretec.cl"
        className="btn-secondary px-6 py-3 transform transition duration-300 ease-in-out hover:scale-105 active:scale-95"
        >
        Escríbenos
        </a>
        </div>
        </div>
    )
}
