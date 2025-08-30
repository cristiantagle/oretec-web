import { supabaseServer } from "@/lib/supabase/server"
import { requireAdmin } from "../_auth"

export async function GET() {
  const unauth = requireAdmin()
  if (unauth) return unauth

  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, name, role, quote, initials, published, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    return new Response(JSON.stringify({ error: "DB error", detail: error.message }), { status: 500 })
  }
  return Response.json(data || [])
}
