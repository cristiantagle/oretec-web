'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabase/browser'

export default function DebugAuth() {
  const supabase = supabaseBrowser()
  const [estado, setEstado] = useState<any>(null)
  const [cargando, setCargando] = useState(false)

  async function asegurarPerfil() {
    try {
      setCargando(true)
      setEstado({ paso: \"obteniendo_sesion\" })
      const ses = await supabase.auth.getSession()
      const t = (ses && ses.data && ses.data.session) ? ses.data.session.access_token : null
      if (!t) { setEstado({ error: \"no_session\" }); return }
      setEstado({ paso: \"llamando_api\" })
      const res = await fetch(\"/api/profile/ensure\", { method: \"POST\", headers: { Authorization: \"Bearer \" + t } })
      const json = await res.json().catch(() => null)
      setEstado({ paso: \"listo\", status: res.status, json })
    } catch (e:any) {
      setEstado({ error: (e && e.message) ? e.message : String(e) })
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { asegurarPerfil() }, [])

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold mb-3">Depuración de autenticación</h1>
      <p className="text-sm text-slate-600 mb-4">Esta vista intenta asegurar tu perfil llamando a <code>/api/profile/ensure</code> con tu token actual.</p>
      <div className="mb-4">
        <button onClick={asegurarPerfil} disabled={cargando} className="rounded bg-blue-600 px-3 py-1.5 text-white disabled:opacity-60">
          {cargando ? \"Procesando…\" : \"Reintentar asegurar perfil\"}
        </button>
      </div>
      <pre className="rounded bg-slate-50 p-3 text-xs overflow-auto border">{JSON.stringify(estado, null, 2)}</pre>
      <div className="mt-6 flex gap-3">
        <Link href=\"/\" className="underline text-blue-700">Ir al inicio</Link>
        <Link href=\"/dashboard\" className="underline text-blue-700">Ir al Panel</Link>
      </div>
    </main>
  )
}
