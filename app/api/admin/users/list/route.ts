import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

function hasSuperCookie(req: Request) {
  const ck = req.headers.get("cookie") || "";
  return /(?:^|;\s*)admin_auth=1(?:;|$)/.test(ck);
}

export async function GET(req: Request) {
  try {
    const isSuper = hasSuperCookie(req);

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) {
      return new Response(JSON.stringify({ error: "missing_env" }), { status: 500 });
    }

    const raw = req.headers.get("authorization") ?? req.headers.get("Authorization");
    const hasBearer = !!raw;
    const authHeader = hasBearer
      ? (raw!.startsWith("Bearer ") ? raw! : `Bearer ${raw}`)
      : "";

    let callerId: string | null = null;
    if (hasBearer) {
      const asUser = createClient(url, anon, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data: userData } = await asUser.auth.getUser();
      callerId = userData?.user?.id ?? null;
      if (!callerId && !isSuper) {
        return new Response(JSON.stringify({ error: "invalid_session" }), { status: 401 });
      }
    } else if (!isSuper) {
      return new Response(JSON.stringify({ error: "missing_bearer" }), { status: 401 });
    }

    const admin = supabaseServer();

    // Si hay Bearer, exigir que el perfil sea admin; si no hay Bearer pero hay cookie, se permite
    if (callerId) {
      const { data: me, error: meErr } = await admin
        .from("profiles")
        .select("id, account_type")
        .eq("id", callerId)
        .maybeSingle();

      if (meErr) {
        return new Response(JSON.stringify({ error: "db_error", detail: meErr.message }), { status: 500 });
      }
      if (!me || me.account_type !== "admin") {
        if (!isSuper) {
          return new Response(JSON.stringify({ error: "forbidden" }), { status: 403 });
        }
      }
    }

    // Parámetros de paginación/búsqueda
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

    query = query.order("updated_at", { ascending: false })
                 .range((page - 1) * pageSize, page * pageSize - 1);

    const { data, count, error } = await query;
    if (error) {
      return new Response(JSON.stringify({ error: "db_error", detail: error.message }), { status: 500 });
    }

    return Response.json({ items: data ?? [], total: count ?? 0, page, pageSize });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: "unexpected", detail: e?.message || String(e) }), { status: 500 });
  }
}
