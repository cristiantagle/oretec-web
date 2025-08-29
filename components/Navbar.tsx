'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

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
        <Link href="/" className="flex items-center gap-3" prefetch={false}>
        <img
        src="/images/logo-oretec.png?v=2"
        alt="OreTec"
        width={48}
        height={48}
        className="block rounded-md"
        loading="eager"
        />
        <span className="text-lg font-semibold tracking-wide" style={{ color: '#1E3A8A' }}>
        ORETEC
        </span>
        </Link>

        {/* Desktop links + Admin */}
        <div className="hidden items-center gap-6 md:flex">
        {links.map((l) => (
            <Link
            key={l.href}
            href={l.href}
            prefetch={false}
            className={`link-anim text-sm ${
                pathname === l.href ? 'text-blue-700' : 'text-slate-600'
            }`}
            >
            {l.label}
            </Link>
        ))}

        {/* Botón Admin */}
        <Link href="/admin" prefetch={false} className="btn-secondary">
        Admin
        </Link>
        </div>

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
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {links.map((l) => (
                <Link
                key={l.href}
                href={l.href}
                prefetch={false}
                className={`py-2 text-sm ${pathname === l.href ? 'text-blue-700' : 'text-slate-700'}`}
                onClick={() => setOpen(false)}
                >
                {l.label}
                </Link>
            ))}

            <Link
            href="/admin"
            prefetch={false}
            className="btn-secondary mt-2"
            onClick={() => setOpen(false)}
            >
            Admin
            </Link>
            </div>
            </div>
        )}
        </nav>
    )
}
