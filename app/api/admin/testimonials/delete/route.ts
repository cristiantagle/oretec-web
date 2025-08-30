import { supabaseServer } from "@/lib/supabase/server"
import { requireAdmin } from "../_auth"

export async function POST(req: Request) {
  const unauth = requireAdmin()
  if (unauth) return unauth

  const body = await req.json().catch(() => ({}))
  const { id } = body || {}
  if (!id) {
    return new Response(JSON.stringify({ error: "Falta id" }), { status: 400 })
  }

  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from("testimonials")
    .delete()
    .eq("id", id)
    .select()

  if (error) {
    return new Response(JSON.stringify({ error: "DB error", detail: error.message }), { status: 500 })
  }
  return Response.json({ ok: true, deleted: data })
}
