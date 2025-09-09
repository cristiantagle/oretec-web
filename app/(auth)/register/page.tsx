'use client'
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabaseBrowser } from "@/lib/supabase/browser"

export default function RegisterPage() {
  const supabase = supabaseBrowser()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null); setMsg(null)
    try {
      const fallback = "https://oretec.cl"
      const site = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : fallback)
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: {
          data: { full_name: fullName || null },
          emailRedirectTo: site.replace(//$/,"") + "/dashboard",
        }
      })
      if (error) { setError(error.message); return }
      if (data.session) {
        // Proyecto sin confirmación por correo: hay sesión activa.
        try {
          const t = data.session.access_token
          await fetch("/api/profile/ensure", { method:"POST", headers:{ Authorization: `Bearer ${t}` } })
            .catch(()=>{})
        } finally {
          router.push("/dashboard")
        }
      } else {
        // Con confirmación: se envió link
        setMsg("Te enviamos un correo de confirmación. Revisa tu bandeja y sigue el enlace para continuar.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-4 text-2xl font-semibold">Crear cuenta</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm">Nombre completo (opcional)</span>
          <input type="text" value={fullName} onChange={e=>setFullName(e.target.value)} className="rounded border px-3 py-2"/>
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Correo</span>
          <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="rounded border px-3 py-2"/>
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Contraseña</span>
          <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="rounded border px-3 py-2"/>
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {msg && <p className="text-sm text-green-700">{msg}</p>}
        <button disabled={loading} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60">
          {loading ? "Creando…" : "Crear cuenta"}
        </button>
      </form>
      <p className="mt-3 text-sm text-slate-600">
        ¿Ya tienes cuenta? <Link href="/login" className="text-blue-700 underline">Ingresar</Link>
      </p>
    </main>
  )
}
