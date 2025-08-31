'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const links = [
    { href: '/', label: 'Inicio' },
{ href: '/courses', label: 'Cursos' },
{ href: '/#contacto', label: 'Contacto' },
]

export default function Navbar() {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    // Activo “inteligente”
    const isActive = (href: string) => {
        if (href === '/') return pathname === '/'
            if (href.startsWith('/#')) return pathname === '/'
                return pathname.startsWith(href)
    }

    // Efecto on-scroll: fondo más sólido + sombra
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 6)
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <nav
        className={`sticky top-0 z-40 w-full border-b backdrop-blur transition-colors duration-300 ${
            scrolled ? 'bg-white/95 shadow-md' : 'bg-white/80'
        }`}
        >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo + nombre */}
        <Link href="/" className="flex items-center gap-3" prefetch={false} aria-label="Ir al inicio">
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
        <div className="hidden items-center gap-2 md:flex">
        {links.map((l) => {
            const active = isActive(l.href)
            return (
                <Link
                key={l.href}
                href={l.href}
                prefetch={false}
                aria-current={active ? 'page' : undefined}
                className={`group relative inline-flex items-center rounded-lg px-2 py-1 text-sm transition-colors ${
                    active ? 'text-blue-700' : 'text-slate-600 hover:text-slate-900'
                } hover:bg-slate-50 focus-visible:bg-slate-50`}
                >
                <span className="relative z-10">{l.label}</span>
                {/* Subrayado animado (activo visible + hover) */}
                <span
                aria-hidden
                className={`pointer-events-none absolute -bottom-0.5 left-2 right-2 h-0.5 origin-left bg-current transition-transform duration-300 ${
                    active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}
                />
                </Link>
            )
        })}

        {/* Botón Admin */}
        <Link href="/admin" prefetch={false} className="btn-secondary ml-2">
        Admin
        </Link>
        </div>

        {/* Mobile button */}
        <button
        className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm md:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir menú"
        aria-expanded={open}
        style={{ borderColor: '#e5e7eb' }}
        >
        Menú
        </button>
        </div>

        {/* Mobile menu */}
        {open && (
            <div className="border-t bg-white md:hidden">
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {links.map((l) => {
                const active = isActive(l.href)
                return (
                    <Link
                    key={l.href}
                    href={l.href}
                    prefetch={false}
                    className={`rounded-lg px-2 py-2 text-sm ${
                        active ? 'text-blue-700 bg-blue-50' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                    onClick={() => setOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    >
                    {l.label}
                    </Link>
                )
            })}

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
