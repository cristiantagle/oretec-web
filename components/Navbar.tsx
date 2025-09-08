"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/browser'

type AccountType = 'admin' | 'instructor' | 'company' | 'student'
type Profile = {
    id: string
    email: string | null
    full_name: string | null
    account_type: AccountType | null
    company_name?: string | null
    phone?: string | null
    avatar_url?: string | null
    updated_at?: string | null
}

const links = [
    { href: '/', label: 'Inicio' },
{ href: '/courses', label: 'Cursos' },
{ href: '/contact', label: 'Contacto' },
]

// ===== Icons por rol =====
function StudentBadgeIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-900/80">
        <rect x="3" y="4" width="18" height="16" rx="2" className="fill-blue-50 stroke-blue-900/40" strokeWidth="1.5"/>
        <rect x="6" y="7" width="6" height="6" rx="3" className="fill-blue-200/60"/>
        <rect x="6" y="15" width="12" height="2.5" rx="1.25" className="fill-blue-200/60"/>
        </svg>
    )
}
function CompanyBadgeIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-900/80">
        <rect x="3" y="5" width="18" height="14" rx="2" className="fill-blue-50 stroke-blue-900/40" strokeWidth="1.5"/>
        <rect x="6" y="8" width="3" height="3" className="fill-blue-200/70"/>
        <rect x="11" y="8" width="3" height="3" className="fill-blue-200/70"/>
        <rect x="16" y="8" width="3" height="3" className="fill-blue-200/70"/>
        </svg>
    )
}
function InstructorBadgeIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-900/80">
        <rect x="3" y="4" width="18" height="14" rx="2" className="fill-blue-50 stroke-blue-900/40" strokeWidth="1.5"/>
        <rect x="6" y="7" width="12" height="2" className="fill-blue-200/70"/>
        <rect x="6" y="11" width="9" height="2" className="fill-blue-200/70"/>
        </svg>
    )
}
function AdminBadgeIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-900/80">
        <circle cx="12" cy="12" r="9" className="fill-blue-50 stroke-blue-900/40" strokeWidth="1.5"/>
        <path d="M12 7v10M7 12h10" className="stroke-blue-900/60" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    )
}
function IconByAccountType({ at }: { at: AccountType | null | undefined }) {
    switch (at) {
        case 'company': return <CompanyBadgeIcon />
        case 'instructor': return <InstructorBadgeIcon />
        case 'admin': return <AdminBadgeIcon />
        case 'student':
        default: return <StudentBadgeIcon />
    }
}

function firstNameFrom(fullName: string | null | undefined, email: string | null | undefined) {
    if (fullName && fullName.trim().length) return fullName.trim().split(/\s+/)[0]
        if (email && email.includes('@')) return email.split('@')[0]
            return 'Usuario'
}

export default function Navbar() {
    const pathname = usePathname()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    // Estado de usuario
    const supabase = useMemo(() => supabaseBrowser(), [])
    const [loadingUser, setLoadingUser] = useState(true)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [menuOpen, setMenuOpen] = useState(false)

    const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 6)
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // Carga de sesión + perfil
    useEffect(() => {
        let mounted = true
        ;(async () => {
            setLoadingUser(true)
            try {
                const { data } = await supabase.auth.getSession()
                const t = data?.session?.access_token || null
                if (!t) {
                    if (mounted) { setProfile(null); setToken(null) }
                    return
                }
                if (mounted) setToken(t)

                    const r = await fetch('/api/profile/get', {
                        headers: { Authorization: `Bearer ${t}` },
                        cache: 'no-store',
                    })
                    if (!r.ok) {
                        if (mounted) setProfile(null)
                            return
                    }
                    const j = await r.json()
                    const at = String(j.account_type ?? 'student').toLowerCase() as AccountType
                    const normAt: AccountType =
                    at === 'admin' || at === 'instructor' || at === 'company' || at === 'student'
                    ? at
                    : 'student'
        if (mounted) {
            setProfile({
                id: j.id,
                email: j.email ?? null,
                full_name: j.full_name ?? null,
                account_type: normAt,
                company_name: j.company_name ?? null,
                phone: j.phone ?? null,
                avatar_url: j.avatar_url ?? null,
                updated_at: j.updated_at ?? null,
            })
        }
            } finally {
                if (mounted) setLoadingUser(false)
            }
        })()
        return () => { mounted = false }
    }, [supabase])

    async function logout() {
        await supabase.auth.signOut()
        setProfile(null)
        setToken(null)
        setMenuOpen(false)
        router.refresh()
        router.push('/')
    }

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

        {/* Desktop links + Auth/User */}
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
                <span
                aria-hidden
                className={`pointer-events-none absolute -bottom-0.5 left-2 right-2 h-0.5 origin-left bg-current transition-transform duration-300 ${
                    active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}
                />
                </Link>
            )
        })}

        {/* Divider sutil */}
        <span className="mx-2 h-5 w-px bg-slate-200" aria-hidden />

        {/* Si NO hay sesión: botones clásicos (sin "Admin" público para evitar confusión) */}
        {!profile && !loadingUser && (
            <>
            <Link href="/login" prefetch={false} className="btn-secondary">
            Ingresar
            </Link>
            <Link href="/register" prefetch={false} className="btn-primary">
            Crear cuenta
            </Link>
            </>
        )}

        {/* Si hay sesión: User menu */}
        {profile && (
            <div className="relative">
            <button
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-3 py-1.5 text-white shadow hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            >
            {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                src={profile.avatar_url}
                alt="Avatar"
                className="h-5 w-5 rounded ring-1 ring-white/50 object-cover"
                />
            ) : (
                <IconByAccountType at={profile.account_type} />
            )}
            <span className="truncate max-w-[12rem]">
            {firstNameFrom(profile.full_name, profile.email)}
            </span>
            </button>

            {menuOpen && (
                <div
                role="menu"
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border bg-white shadow-lg ring-1 ring-black/5"
                >
                <div className="px-3 py-2 text-xs text-slate-500">
                Conectado como<br/>
                <span className="font-medium text-slate-900">{profile.email || '-'}</span>
                </div>
                <div className="h-px bg-slate-200" />
                <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm hover:bg-slate-50"
                role="menuitem"
                >
                Panel
                </Link>
                <Link
                href="/dashboard/profile"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm hover:bg-slate-50"
                role="menuitem"
                >
                Mi perfil
                </Link>
                {/* Admin solo si es admin */}
                {profile.account_type === 'admin' && (
                    <Link
                    href="/admin/users"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm hover:bg-slate-50"
                    role="menuitem"
                    >
                    Admin · Usuarios
                    </Link>
                )}
                <div className="h-px bg-slate-200" />
                <button
                onClick={logout}
                className="block w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                role="menuitem"
                >
                Salir
                </button>
                </div>
            )}
            </div>
        )}
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

            {/* Auth en mobile */}
            {!profile && !loadingUser && (
                <div className="mt-2 flex flex-col gap-2">
                <Link
                href="/login"
                prefetch={false}
                className="btn-secondary"
                onClick={() => setOpen(false)}
                >
                Ingresar
                </Link>
                <Link
                href="/register"
                prefetch={false}
                className="btn-primary"
                onClick={() => setOpen(false)}
                >
                Crear cuenta
                </Link>
                </div>
            )}

            {/* User en mobile */}
            {profile && (
                <div className="mt-3 rounded-xl border bg-blue-50/60 px-3 py-2">
                <div className="flex items-center gap-2">
                {profile.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="h-6 w-6 rounded ring-1 ring-blue-200 object-cover"
                    />
                ) : (
                    <IconByAccountType at={profile.account_type} />
                )}
                <div className="text-sm">
                <div className="font-medium text-blue-950">
                {firstNameFrom(profile.full_name, profile.email)}
                </div>
                <div className="text-xs text-slate-600">{profile.email || '-'}</div>
                </div>
                </div>
                <div className="mt-2 grid gap-1">
                <Link
                href="/dashboard"
                prefetch={false}
                className="rounded px-2 py-1 text-sm hover:bg-white"
                onClick={() => setOpen(false)}
                >
                Panel
                </Link>
                <Link
                href="/dashboard/profile"
                prefetch={false}
                className="rounded px-2 py-1 text-sm hover:bg-white"
                onClick={() => setOpen(false)}
                >
                Mi perfil
                </Link>
                {profile.account_type === 'admin' && (
                    <Link
                    href="/admin/users"
                    prefetch={false}
                    className="rounded px-2 py-1 text-sm hover:bg-white"
                    onClick={() => setOpen(false)}
                    >
                    Admin · Usuarios
                    </Link>
                )}
                <button
                onClick={() => { setOpen(false); logout() }}
                className="mt-1 rounded px-2 py-1 text-left text-sm text-red-700 hover:bg-red-50"
                >
                Salir
                </button>
                </div>
                </div>
            )}
            </div>
            </div>
        )}
        </nav>
    )
}
