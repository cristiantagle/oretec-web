import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";
import { listMyEnrollmentsStorage } from "@/lib/enrollments/storage";

export async function GET(req: Request) {
  try {
    const raw = req.headers.get("authorization") ?? req.headers.get("Authorization");
    if (!raw) return new Response(JSON.stringify({ error: "missing_bearer" }), { status: 401 });
    const authHeader = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!url || !anon) return new Response(JSON.stringify({ error: "missing_env" }), { status: 500 });

    const asUser = createClient(url, anon, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: udata, error: uerr } = await asUser.auth.getUser();
    if (uerr || !udata?.user) return new Response(JSON.stringify({ error: "invalid_session" }), { status: 401 });
    const uid = udata.user.id;

    // Intento 1: tabla enrollments
    try {
      const admin = supabaseServer();
      const { data, error } = await admin
        .from("enrollments")
        .select("id, course_id, qty, status, paid, created_at, updated_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        return Response.json({ ok: true, items: data.map(d => ({ ...d, backend: "table" })) });
      }

      const msg = String(error?.message || "");
      if (msg.includes("relation") && msg.includes("does not exist")) {
        throw new Error("fallback_to_storage");
      }
      return new Response(JSON.stringify({ error: "db_error", detail: error?.message || "unknown" }), { status: 500 });
    } catch (e: any) {
      // Intento 2: Storage
      const items = await listMyEnrollmentsStorage(uid);
      return Response.json({ ok: true, items });
    }
  } catch (e: any) {
    return new Response(JSON.stringify({ error: "unexpected", detail: e?.message || String(e) }), { status: 500 });
  }
}

