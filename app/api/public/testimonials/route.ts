import { supabaseServer } from "@/lib/supabase/server"

export async function GET() {
  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, name, role, quote, initials")
    .eq("published", true)
    .order("created_at", { ascending: false })

  if (error) {
    return new Response(JSON.stringify({ error: "DB error", detail: error.message }), { status: 500 })
  }
  return Response.json(data || [])
}
