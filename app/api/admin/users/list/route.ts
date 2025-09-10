import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";
import { cookies } from "next/headers";

// Aceptamos cookie admin_auth=1 (superadmin) O Bearer de usuario admin
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const admin = supabaseServer();

    // 0) ¿superadmin via cookie?
    const ck = cookies();
    const isSuper = ck.get("admin_auth")?.value === "1";

    let callerId: string | null = null;
    let callerIsAdmin = false;

    if (isSuper) {
      // superadmin: no necesitamos bearer ni validar perfil
      callerIsAdmin = true;
    } else {
      // 1) Sesión del usuario que llama (Bearer del cliente)
      const raw = req.headers.get("authorization") ?? req.headers.get("Authorization");
      if (!raw) {
        return new Response(JSON.stringify({ error: "missing_bearer" }), { status: 401 });
      }
      const authHeader = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;

      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !anon) {
        return new Response(JSON.stringify({ error: "missing_env" }), { status: 500 });
      }

      // Cliente "como el usuario" para validar identidad
      const asUser = createClient(url, anon, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data: userData, error: userErr } = await asUser.auth.getUser();
      if (userErr || !userData?.user) {
        return new Response(JSON.stringify({ error: "invalid_session" }), { status: 401 });
      }
      callerId = userData.user.id;

      // 2) Verificar que sea admin en perfiles
      const { data: me, error: meErr } = await admin
        .from("profiles")
        .select("id, account_type")
        .eq("id", callerId)
        .maybeSingle();
      if (meErr) {
        return new Response(JSON.stringify({ error: "db_error", detail: meErr.message }), { status: 500 });
      }
      if (!me || me.account_type !== "admin") {
        return new Response(JSON.stringify({ error: "forbidden" }), { status: 403 });
      }
      callerIsAdmin = true;
    }

    if (!callerIsAdmin) {
      return new Response(JSON.stringify({ error: "forbidden" }), { status: 403 });
    }

    // 3) Parámetros: paginación + búsqueda
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSizeRaw = Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10));
    const pageSize = Math.min(pageSizeRaw, 100);
    const q = (searchParams.get("search") || "").trim();

    let query = admin
      .from("profiles")
      .select(
        "id,email,full_name,rut,company_name,account_type,phone,created_at,updated_at",
        { count: "exact" }
      );

    if (q) {
      query = query.or(
        [
          `full_name.ilike.%${q}%`,
          `email.ilike.%${q}%`,
          `company_name.ilike.%${q}%`,
          `rut.ilike.%${q}%`,
          `phone.ilike.%${q}%`,
        ].join(",")
      );
    }

    query = query
      .order("updated_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    const { data, count, error } = await query;
    if (error) {
      return new Response(JSON.stringify({ error: "db_error", detail: error.message }), { status: 500 });
    }

    return Response.json({
      items: data ?? [],
      total: count ?? 0,
      page,
      pageSize,
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: "unexpected", detail: e?.message || String(e) }),
      { status: 500 }
    );
  }
}
