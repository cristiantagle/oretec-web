'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const links = [
    { href: '/', label: 'Inicio' },
{ href: '/courses', label: 'Cursos' },
{ href: '/#contacto', label: 'Contacto' },
{ href: '/admin', label: 'Admin' },
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
        src="/images/logo-oretec.png?v=1"  // <-- PNG directo; si subes SVG, cambia a .svg
        alt="OreTec"
        width={36}
        height={36}
        style={{ display: 'block', borderRadius: 6 }}
        loading="eager"
        />
        <span className="text-lg font-semibold tracking-wide" style={{ color: '#1E3A8A' }}>
        ORETEC
        </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden gap-6 md:flex">
        {links.map((l) => (
            <Link
            key={l.href}
            href={l.href}
            className={`text-sm transition ${
                pathname === l.href ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
            prefetch={false}
            >
            {l.label}
            </Link>
        ))}
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
            <div className="mx-auto flex max-w-6xl flex-col px-4 py-3">
            {links.map((l) => (
                <Link
                key={l.href}
                href={l.href}
                className={`py-2 text-sm ${pathname === l.href ? 'text-slate-900' : 'text-slate-700'}`}
                onClick={() => setOpen(false)}
                prefetch={false}
                >
                {l.label}
                </Link>
            ))}
            </div>
            </div>
        )}
        </nav>
    )
}
