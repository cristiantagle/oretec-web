import { supabaseServer } from "@/lib/supabase/server"
import { requireAdmin } from "../_auth"

export async function POST(req: Request) {
  const unauth = requireAdmin()
  if (unauth) return unauth

  const body = await req.json().catch(() => ({}))
  const { id, ...fields } = body || {}
  if (!id) {
    return new Response(JSON.stringify({ error: "Falta id" }), { status: 400 })
  }

  const allowed = ["name","role","quote","initials","published"]
  const update: Record<string, any> = {}
  for (const k of allowed) {
    if (k in fields) update[k] = fields[k]
  }
  if (!Object.keys(update).length) {
    return new Response(JSON.stringify({ error: "Sin cambios" }), { status: 400 })
  }

  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from("testimonials")
    .update(update)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: "DB error", detail: error.message }), { status: 500 })
  }
  return Response.json({ ok: true, testimonial: data })
}
