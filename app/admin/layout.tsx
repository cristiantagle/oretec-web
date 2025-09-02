// app/admin/layout.tsx
'use client'

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HomeButton from "@/components/HomeButton";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="bg-white">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <strong className="text-lg" style={{ color: "#1E3A8A" }}>
        Administración
        </strong>
        <div className="flex items-center gap-2">
        <Link
        href="/"
        className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        >
        Salir del admin
        </Link>
        </div>
        </div>

        {/* Tabs con subrayado animado */}
        <nav className="border-t">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2">
        <AdminTab href="/admin/users" label="Usuarios" pathname={pathname} />
        <AdminTab href="/admin/courses" label="Cursos" pathname={pathname} />
        <AdminTab href="/admin/reports" label="Reportes" pathname={pathname} />
        </div>
        </nav>
        </header>

        {/* Contenido */}
        <main className="mx-auto max-w-6xl px-4 py-4">{children}</main>

        <HomeButton />
        </div>
    );
}

function AdminTab({
    href,
    label,
    pathname,
}: {
    href: string;
    label: string;
    pathname: string;
}) {
    const active = pathname.startsWith(href);

    return (
        <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`group relative inline-flex items-center px-2 py-1 text-sm transition-colors ${
            active ? "text-blue-700" : "text-slate-600 hover:text-slate-900"
        }`}
        >
        <span className="relative z-10">{label}</span>
        <span
        aria-hidden
        className={`pointer-events-none absolute -bottom-0.5 left-0 right-0 h-0.5 origin-left bg-current transition-transform duration-300 ${
            active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`}
        />
        </Link>
    );
}
