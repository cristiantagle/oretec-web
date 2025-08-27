'use client'
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
    const pathname = usePathname()

    const link = (href: string, label: string) => (
        <Link
        key={href}
        href={href}
        className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
            pathname === href
            ? "bg-slate-100 text-slate-900"
            : "text-slate-700 hover:bg-slate-50"
        }`}
        >
        {label}
        </Link>
    )

    return (
        <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-base font-bold text-[#1E3A8A]">
        OreTec
        </Link>
        <nav className="flex items-center gap-1">
        {link("/courses", "Ver cursos")}
        {link("/dashboard/proof", "Enviar comprobante")}
        {link("/admin", "Admin")}
        </nav>
        </div>
        </header>
    )
}

