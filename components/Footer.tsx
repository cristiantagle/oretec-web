'use client'
import Image from 'next/image'
import Link from 'next/link'
import FadeIn from '@/components/FadeIn'

export default function Footer() {
    return (
        <footer className="mt-16 border-t bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-3">
        <FadeIn>
        <div className="flex items-center gap-3">
        <Image
        src="/images/logo-oretec.png"
        alt="OreTec"
        width={32}
        height={32}
        className="rounded-md"
        />
        <span className="font-semibold" style={{ color: '#1E3A8A' }}>
        ORETEC
        </span>
        </div>
        </FadeIn>

        <FadeIn delay={0.1}>
        <div className="text-sm text-slate-600">
        <div className="font-medium text-slate-900">Formación e-learning</div>
        <p className="mt-1">Prevención y Seguridad Laboral — Chile.</p>
        </div>
        </FadeIn>

        <FadeIn delay={0.2}>
        <div className="text-sm text-slate-600">
        <div className="font-medium text-slate-900">Enlaces</div>
        <ul className="mt-1 space-y-1">
        <li>
        <Link href="/courses" className="hover:underline">
        Cursos
        </Link>
        </li>
        <li>
        <a href="mailto:contacto@oretec.cl" className="hover:underline">
        contacto@oretec.cl
        </a>
        </li>
        <li>
        <Link href="/admin" className="hover:underline">
        Admin
        </Link>
        </li>
        </ul>
        </div>
        </FadeIn>
        </div>
        <FadeIn delay={0.3}>
        <div className="border-t py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} OreTec. Todos los derechos reservados.
        </div>
        </FadeIn>
        </footer>
    )
}
