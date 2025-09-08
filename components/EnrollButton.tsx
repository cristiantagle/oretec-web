"use client"

import { useState } from \"react\"
import { supabaseBrowser } from \"@/lib/supabase/browser\"

type Props = {
  courseId: string
  defaultQty?: number
  label?: string
  className?: string
}

export default function EnrollButton({
  courseId,
  defaultQty = 1,
  label = \"Inscribirme\",
  className = \"inline-flex items-center rounded-lg bg-blue-900 px-4 py-2 text-white shadow hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300\",
}: Props) {
  const supabase = supabaseBrowser()
  const [qty, setQty] = useState<number>(defaultQty)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)

  async function enroll() {
    setLoading(true); setErr(null); setOkMsg(null)
    try {
      const { data } = await supabase.auth.getSession()
      const token = data?.session?.access_token
      if (!token) {
        window.location.href = \"/login\"
        return
      }
      const r = await fetch(\"/api/enrollments/create\", {
        method: \"POST\",
        headers: { \"Content-Type\": \"application/json\", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ course_id: courseId, qty }),
      })
      const j = await r.json()
      if (!r.ok || !j?.ok) throw new Error(j?.detail || j?.error || \"enroll_error\")
      setOkMsg(\"Inscripción creada. Te contactaremos para finalizar.\")
    } catch (e: any) {
      setErr(e?.message || \"No se pudo inscribir\")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className=\"inline-flex items-center gap-2\">
      <input
        type=\"number\"
        min={1}
        value={qty}
        onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))}
        className=\"w-16 rounded border px-2 py-1 text-sm\"
        title=\"Cantidad de participantes\"
      />
      <button onClick={enroll} disabled={loading} className={className}>
        {loading ? \"Inscribiendo…\" : label}
      </button>
      {err && <span className=\"text-xs text-red-600\">{err}</span>}
      {okMsg && <span className=\"text-xs text-green-700\">{okMsg}</span>}
    </div>
  )
}

