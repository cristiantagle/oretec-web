import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Estrategia de acceso:
 * - Si hay cookie "admin_auth=1" → acceso total (superadmin).
 * - Si no, exige Authorization: Bearer <token> y valida que el perfil tenga account_type='admin'.
 *
 * Nota: Todas las lecturas se hacen con service-role (supabaseServer) para evitar RLS.
 */

function parseCookies(cookieHeader: string | null | undefined): Record<string,string> {
  const out: Record<string,string> = {};
  if (!cookieHeader) return out;
  cookieHeader.split(";").forEach((p) => {
    const i = p.indexOf("=");
    if (i > -1) {
      const k = p.slice(0, i).trim();
      const v = p.slice(i + 1).trim();
      out[k] = decodeURIComponent(v);
    }
  });
  return out;
}

export async function GET(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) {
      return new Response(JSON.stringify({ error: "missing_env" }), { status: 500 });
    }

    // 1) ¿Tiene cookie superadmin?
    const cookies = parseCookies(req.headers.get("cookie"));
    const hasSuperadmin = cookies["admin_auth"] === "1";

    let requesterUserId: string | null = null;
    let requesterIsAdmin = false;

    if (hasSuperadmin) {
      requesterIsAdmin = true; // cookie autoriza todo
    } else {
      // 2) Validar Authorization Bearer y rol admin por Supabase
      const raw = req.headers.get("authorization") ?? req.headers.get("Authorization");
      if (!raw) {
        return new Response(JSON.stringify({ error: "not_authenticated" }), { status: 401 });
      }
      const authHeader = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;

      const asUser = createClient(url, anon, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data: userData, error: userErr } = await asUser.auth.getUser();
      if (userErr || !userData?.user) {
        return new Response(JSON.stringify({ error: "invalid_session" }), { status: 401 });
      }
      requesterUserId = userData.user.id;

      // Verificar en perfiles
      const adminSrv = supabaseServer();
      const { data: me, error: meErr } = await adminSrv
        .from("profiles")
        .select("id, account_type")
        .eq("id", requesterUserId)
        .maybeSingle();

      if (meErr) {
        return new Response(JSON.stringify({ error: "db_error", detail: meErr.message }), { status: 500 });
      }
      if (!me || me.account_type !== "admin") {
        return new Response(JSON.stringify({ error: "forbidden" }), { status: 403 });
      }
      requesterIsAdmin = true;
    }

    if (!requesterIsAdmin) {
      return new Response(JSON.stringify({ error: "forbidden" }), { status: 403 });
    }

    // 3) Parámetros búsqueda/paginación
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSizeRaw = Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10));
    const pageSize = Math.min(pageSizeRaw, 100);
    const q = (searchParams.get("search") || "").trim();

    const admin = supabaseServer();
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
    return new Response(JSON.stringify({ error: "unexpected", detail: e?.message || String(e) }), { status: 500 });
  }
}
