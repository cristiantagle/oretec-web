// app/api/admin/bootstrap/promote-self/route.ts
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * POST /api/admin/bootstrap/promote-self
 * Requisitos:
 *  - Authorization: Bearer <token de sesión>
 *  - El email del caller debe estar en ADMIN_BOOTSTRAP_EMAILS (coma-separado)
 *  - Usa SERVICE ROLE por debajo para actualizar profiles.
 *  - Quita este endpoint cuando ya tengas al menos un admin creado.
 */
export async function POST(req: Request) {
  try {
    const raw = req.headers.get("authorization") ?? req.headers.get("Authorization");
    if (!raw) return new Response(JSON.stringify({ error: "missing_bearer" }), { status: 401 });
    const authHeader = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) {
      return new Response(JSON.stringify({ error: "missing_supabase_env" }), { status: 500 });
    }

    const asUser = createClient(url, anon, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: udata, error: uerr } = await asUser.auth.getUser();
    if (uerr || !udata?.user) {
      return new Response(JSON.stringify({ error: "invalid_session" }), { status: 401 });
    }
    const user = udata.user;
    const callerEmail = (user.email || (user.user_metadata?.email as string | undefined) || "").toLowerCase();

    const allowed = (process.env.ADMIN_BOOTSTRAP_EMAILS || "")
      .split(",")
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    if (!allowed.includes(callerEmail)) {
      return new Response(JSON.stringify({ error: "forbidden_email" }), { status: 403 });
    }

    const admin = supabaseServer();

    // Opcional: si ya hay admins, puedes bloquear más ascensos automáticos
    // const { data: cnt } = await admin
    //   .from("profiles")
    //   .select("id", { count: "exact", head: true })
    //   .eq("account_type", "admin");
    // if ((cnt?.length ?? 0) > 0) {
    //   return new Response(JSON.stringify({ error: "already_has_admin" }), { status: 400 });
    // }

    const { error: upErr } = await admin
      .from("profiles")
      .update({ account_type: "admin", updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (upErr) {
      return new Response(JSON.stringify({ error: "db_error", detail: upErr.message }), { status: 500 });
    }

    return Response.json({ ok: true, promoted: user.id, email: callerEmail });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: "unexpected", detail: e?.message || String(e) }),
      { status: 500 }
    );
  }
}
