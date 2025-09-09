'use client'

import Link from 'next/link'
import AuthGate from '@/components/AuthGate'
import ProfileEnsure from '@/components/ProfileEnsure'

export default function DashboardPage() {
  return (
    <>
      <AuthGate />
      <ProfileEnsure />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-blue-950">Panel</h1>
        <p className="mt-2 text-slate-600">Bienvenido/a. Tu perfil y sesión están inicializados.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href="/dashboard/profile" className="rounded-xl border p-4 hover:bg-slate-50">
            <div className="text-sm font-medium">Mi perfil</div>
            <div className="text-xs text-slate-500">Actualiza tu información</div>
          </Link>
          <Link href="/courses" className="rounded-xl border p-4 hover:bg-slate-50">
            <div className="text-sm font-medium">Cursos</div>
            <div className="text-xs text-slate-500">Explora la oferta disponible</div>
          </Link>
        </div>
      </main>
    </>
  )
}
