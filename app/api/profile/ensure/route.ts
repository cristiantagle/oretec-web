import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * POST /api/profile/ensure
 * Crea/actualiza el perfil del usuario autenticado (id, email, full_name…).
 * - Authorization: Bearer <token de supabase>
 */
export async function POST(req: Request) {
  try {
    const raw = req.headers.get("authorization") || req.headers.get("Authorization");
    if (!raw) {
      return new Response(JSON.stringify({ error: "no_auth_header" }), { status: 401 });
    }
    const authHeader = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) {
      return new Response(JSON.stringify({ error: "supabase_env_missing" }), { status: 500 });
    }

    // 1) Obtener usuario desde el token recibido
    const supaUser = createClient(url, anon, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userErr } = await supaUser.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "not_authenticated" }), { status: 401 });
    }
    const user = userData.user;

    // 2) Upsert del perfil con Service Role (evita RLS)
    const admin = supabaseServer();
    const fullName =
      (user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name)) ||
      user.user_metadata?.fullName ||
      null;

    const payload: any = {
      id: user.id,
      email: user.email ?? null,
      full_name: fullName,
      updated_at: new Date().toISOString(),
    };

    const { error } = await admin
      .from("profiles")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      return new Response(JSON.stringify({ error: "db_error", detail: error.message }), { status: 500 });
    }

    return Response.json({ ok: true, id: user.id });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: "unexpected", detail: String(e?.message || e) }), { status: 500 });
  }
}
