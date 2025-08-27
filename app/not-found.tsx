import Link from 'next/link'

export default function NotFound() {
    return (
        <main className="grid min-h-[70vh] place-items-center px-4">
        <div className="text-center">
        <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-gradient-to-tr from-[#1E3A8A]/15 to-slate-200" />
        <h1 className="text-2xl font-bold text-slate-900">Página no encontrada</h1>
        <p className="mt-2 text-slate-600">Puede que el enlace esté roto o que la página haya sido movida.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
        <Link href="/" className="rounded-xl bg-[#1E3A8A] px-5 py-3 text-sm font-medium text-white hover:opacity-95">
        Ir al inicio
        </Link>
        <Link
        href="/courses"
        className="rounded-xl border border-[#1E3A8A] px-5 py-3 text-sm font-medium text-[#1E3A8A] hover:bg-[#1E3A8A]/5"
        >
        Ver cursos
        </Link>
        </div>
        </div>
        </main>
    )
}
