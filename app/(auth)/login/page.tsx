'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabaseBrowser } from "@/lib/supabase/browser"

export default function LoginPage() {
  const supabase = supabaseBrowser()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    try {
      const ses = await supabase.auth.getSession()
      const token = ses?.data?.session?.access_token
      if (token) {
        await fetch("/api/profile/ensure", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(()=>{})
      }
    } finally {
      router.push("/dashboard")
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-4 text-2xl font-semibold">Ingresar</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm">Correo</span>
          <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="rounded border px-3 py-2"/>
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Contraseña</span>
          <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="rounded border px-3 py-2"/>
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60">
          {loading ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
      <p className="mt-3 text-sm text-slate-600">
        ¿No tienes cuenta? <Link href="/register" className="text-blue-700 underline">Crear cuenta</Link>
      </p>
    </main>
  )
}
