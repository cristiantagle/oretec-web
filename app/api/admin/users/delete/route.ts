import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    // 1) Validar sesión
    const raw = req.headers.get("authorization") ?? req.headers.get("Authorization");
    if (!raw) return new Response(JSON.stringify({ error: "missing_bearer" }), { status: 401 });
    const authHeader = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;

    const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!projectUrl || !anon) {
      return new Response(JSON.stringify({ error: "missing_supabase_env" }), { status: 500 });
    }

    // Cliente "como el usuario" para leer su identidad
    const asUser = createClient(projectUrl, anon, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: udata, error: uerr } = await asUser.auth.getUser();
    if (uerr || !udata?.user) {
      return new Response(JSON.stringify({ error: "invalid_session" }), { status: 401 });
    }

    // 2) Verificar que el caller sea admin
    const admin = supabaseServer();
    const { data: me, error: meErr } = await admin
    .from("profiles")
    .select("id, account_type")
    .eq("id", udata.user.id)
    .maybeSingle();
    if (meErr) {
      return new Response(JSON.stringify({ error: "DB error", detail: meErr.message }), { status: 500 });
    }
    if (!me || me.account_type !== "admin") {
      return new Response(JSON.stringify({ error: "forbidden" }), { status: 403 });
    }

    // 2.5) Doble control: x-admin-token
    const headerToken = req.headers.get('x-admin-token') ?? ''
    const adminToken = process.env.ADMIN_TOKEN ?? ''
    if (!adminToken || headerToken !== adminToken) {
      return new Response(JSON.stringify({ error: 'admin_token_required' }), { status: 403 })
    }

    // 3) Parse body
    const body = (await req.json().catch(() => ({}))) as { user_id?: string };
    const userId = (body.user_id || "").trim();
    if (!userId) {
      return new Response(JSON.stringify({ error: "missing_user_id" }), { status: 400 });
    }

    // 4) Borrar perfil en profiles
    const { error: delProfileErr } = await admin.from("profiles").delete().eq("id", userId);
    if (delProfileErr) {
      return new Response(
        JSON.stringify({ error: "DB error (delete profile)", detail: delProfileErr.message }),
                          { status: 500 }
      );
    }

    // 5) Intentar borrar el usuario de auth (GoTrue Admin)
    try {
      // @ts-ignore - typings pueden variar
      const { error: delAuthErr } = await admin.auth.admin.deleteUser(userId);
      if (delAuthErr) {
        return Response.json({
          ok: true,
          note: "Perfil eliminado. No se pudo eliminar auth user: " + delAuthErr.message,
        });
      }
    } catch (e: any) {
      return Response.json({
        ok: true,
        note: "Perfil eliminado. No se pudo eliminar auth user: " + (e?.message || String(e)),
      });
    }

    return Response.json({ ok: true });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: "unexpected", detail: e?.message || String(e) }),
                        { status: 500 }
    );
  }
}
