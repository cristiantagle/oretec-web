import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";
import { putEnrollmentStorage } from "@/lib/enrollments/storage";

type Body = {
  course_id: string;
  qty?: number;
  payer_email?: string | null;
};

export async function POST(req: Request) {
  try {
    const raw = req.headers.get("authorization") ?? req.headers.get("Authorization");
    if (!raw) return new Response(JSON.stringify({ error: "missing_bearer" }), { status: 401 });
    const authHeader = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!url || !anon) return new Response(JSON.stringify({ error: "missing_env" }), { status: 500 });

    // Identidad del usuario que llama (como usuario)
    const asUser = createClient(url, anon, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: udata, error: uerr } = await asUser.auth.getUser();
    if (uerr || !udata?.user) return new Response(JSON.stringify({ error: "invalid_session" }), { status: 401 });
    const uid = udata.user.id;

    const body = (await req.json().catch(() => ({}))) as Body;
    const course_id = (body.course_id || "").trim();
    const qty = Math.max(1, Number(body.qty ?? 1));
    const payer_email = body.payer_email ?? null;
    if (!course_id) return new Response(JSON.stringify({ error: "missing_course_id" }), { status: 400 });

    // Intento 1: usar tabla enrollments si existe (service role)
    try {
      const admin = supabaseServer();
      const { data, error } = await admin
        .from("enrollments")
        .insert({
          user_id: uid,
          course_id,
          qty,
          payer_email,
          status: "pending",
          paid: false,
        })
        .select("id, status, qty, course_id, created_at")
        .maybeSingle();

      if (!error && data) {
        return Response.json({ ok: true, enrollment: { ...data, backend: "table" } });
      }

      // Si el error sugiere tabla inexistente, caemos a Storage
      const msg = String(error?.message || "");
      if (msg.includes("relation") && msg.includes("does not exist")) {
        throw new Error("fallback_to_storage");
      }

      // Otro error real de BD
      return new Response(JSON.stringify({ error: "db_error", detail: error?.message || "unknown" }), { status: 500 });
    } catch (e: any) {
      if (String(e?.message) !== "fallback_to_storage") {
        // Si no es el caso esperado, seguimos intentando Storage igual
      }
      // Intento 2: Storage (JSON)
      const doc = await putEnrollmentStorage({ user_id: uid, course_id, qty, payer_email });
      return Response.json({ ok: true, enrollment: doc });
    }
  } catch (e: any) {
    return new Response(JSON.stringify({ error: "unexpected", detail: e?.message || String(e) }), { status: 500 });
  }
}

