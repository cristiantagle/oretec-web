
import { supabaseServer } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}))
    const { name, email, message, phone = null, company = null } = json || {}

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Faltan campos: name, email, message" }), { status: 400 })
    }

    const ua = req.headers.get("user-agent") || null
    const ip =
      // Vercel/Proxy headers comunes
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null

    const supabase = supabaseServer()
    const { error } = await supabase.from("contacts").insert([{
      name, email, message, phone, company, user_agent: ua, ip
    }])

    if (error) {
      return new Response(JSON.stringify({ error: "DB error", detail: error.message }), { status: 500 })
    }

    return Response.json({ ok: true })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: "Bad Request", detail: String(e?.message || e) }), { status: 400 })
  }
}

