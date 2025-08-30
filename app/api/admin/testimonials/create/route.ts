import { supabaseServer } from "@/lib/supabase/server"
import { requireAdmin } from "../_auth"

export async function POST(req: Request) {
  const unauth = requireAdmin()
  if (unauth) return unauth

  const body = await req.json().catch(() => ({}))
  const { name, role, quote, initials, published = true } = body || {}
  if (!name || !quote) {
    return new Response(JSON.stringify({ error: "Faltan campos requeridos (name, quote)" }), { status: 400 })
  }

  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from("testimonials")
    .insert([{ name, role: role || null, quote, initials: initials || null, published }])
    .select()
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: "DB error", detail: error.message }), { status: 500 })
  }
  return Response.json({ ok: true, testimonial: data })
}
