import { Suspense } from 'react'
import LoginForm from './LoginForm'

// Opcional: fuerza render dinámico si quieres evitar prerender
// export const dynamic = 'force-dynamic'

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border p-6">Cargando…</div>
      </main>
    }>
    <LoginForm />
    </Suspense>
  )
}
