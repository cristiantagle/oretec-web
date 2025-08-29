'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import FadeIn from '@/components/FadeIn'

const links = [
    { href: '/', label: 'Inicio' },
{ href: '/courses', label: 'Cursos' },
{ href: '/#contacto', label: 'Contacto' },
]

export default function Navbar() {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)

    return (
        <nav className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo + nombre */}
        <FadeIn y={8}>
        <Link href="/" className="flex items-center gap-3" prefetch={false}>
        <img
        src="/images/logo-oretec.png?v=2"
        alt="OreTec"
        width={44}
        height={44}
        style={{ display: 'block', borderRadius: 8 }}
        loading="eager"
        />
        <span className="text-lg font-semibold tracking-wide" style={{ color: '#1E3A8A' }}>
        ORETEC
        </span>
        </Link>
        </FadeIn>

        {/* Desktop links + Admin */}
        <FadeIn delay={0.05} y={8}>
        <div className="hidden items-center gap-6 md:flex">
        {links.map((l) => (
            <Link
            key={l.href}
            href={l.href}
            prefetch={false}
            className={`text-sm transition ${
                pathname === l.href ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
            >
            {l.label}
            </Link>
        ))}

        {/* Botón Admin con estilo corporativo */}
        <Link href="/admin" prefetch={false} className="btn-secondary">
        Admin
        </Link>
        </div>
        </FadeIn>

        {/* Mobile button */}
        <button
        className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm md:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir menú"
        style={{ borderColor: '#e5e7eb' }}
        >
        Menú
        </button>
        </div>

        {/* Mobile menu */}
        {open && (
            <div className="border-t bg-white md:hidden">
            <FadeIn y={6}>
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {links.map((l, i) => (
                <FadeIn key={l.href} delay={0.03 * (i + 1)} y={6}>
                <Link
                href={l.href}
                prefetch={false}
                className={`py-2 text-sm ${
                    pathname === l.href ? 'text-slate-900' : 'text-slate-700'
                }`}
                onClick={() => setOpen(false)}
                >
                {l.label}
                </Link>
                </FadeIn>
            ))}

            {/* Admin como botón en móvil */}
            <FadeIn delay={0.12} y={6}>
            <Link
            href="/admin"
            prefetch={false}
            className="btn-secondary"
            onClick={() => setOpen(false)}
            >
            Admin
            </Link>
            </FadeIn>
            </div>
            </FadeIn>
            </div>
        )}
        </nav>
    )
}
