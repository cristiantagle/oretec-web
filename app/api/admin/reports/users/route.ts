
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

type AccountType = "admin" | "instructor" | "company" | "student";

function parseDate(v: string | null): string | null {
  if (!v) return null;
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

export async function GET(req: Request) {
  try {
    // 0) Auth via Bearer (cliente)
    const raw = req.headers.get("authorization") ?? req.headers.get("Authorization");
    if (!raw) return new Response(JSON.stringify({ error: "missing_bearer" }), { status: 401 });
    const authHeader = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) {
      return new Response(JSON.stringify({ error: "missing_env" }), { status: 500 });
    }

    // 1) Identidad del llamante
    const asUser = createClient(url, anon, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: udata, error: uerr } = await asUser.auth.getUser();
    if (uerr || !udata?.user) {
      return new Response(JSON.stringify({ error: "invalid_session" }), { status: 401 });
    }

    // 2) Verificar que sea ADMIN usando service role
    const admin = supabaseServer();
    const { data: me, error: meErr } = await admin
      .from("profiles")
      .select("id, account_type")
      .eq("id", udata.user.id)
      .maybeSingle();
    if (meErr) {
      return new Response(JSON.stringify({ error: "db_error", detail: meErr.message }), { status: 500 });
    }
    if (!me || me.account_type !== "admin") {
      return new Response(JSON.stringify({ error: "forbidden" }), { status: 403 });
    }

    // 3) Parámetros
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSizeRaw = Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10));
    const pageSize = Math.min(pageSizeRaw, 100);
    const q = (searchParams.get("search") || "").trim();
    const fromIso = parseDate(searchParams.get("from"));
    const toIso = parseDate(searchParams.get("to"));
    const format = (searchParams.get("format") || "").toLowerCase(); // csv | ""

    // 4) Filtros base para listados y conteos
    function applyFilters(qb: any) {
      if (q) {
        qb = qb.or([
          `full_name.ilike.%${q}%`,
          `email.ilike.%${q}%`,
          `company_name.ilike.%${q}%`,
          `rut.ilike.%${q}%`,
          `phone.ilike.%${q}%`,
        ].join(","));
      }
      if (fromIso) qb = qb.gte("created_at", fromIso);
      if (toIso) qb = qb.lte("created_at", toIso);
      return qb;
    }

    // 5) KPIs (cuentas exactas)
    // total
    const totalQ = applyFilters(admin.from("profiles").select("id", { count: "exact", head: true }));
    const { count: totalCount, error: totalErr } = await totalQ;
    if (totalErr) return new Response(JSON.stringify({ error: "db_error", detail: totalErr.message }), { status: 500 });

    // nuevos últimos 30 días (ignora rango manual)
    const last30Iso = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const { count: new30, error: newErr } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", last30Iso);
    if (newErr) return new Response(JSON.stringify({ error: "db_error", detail: newErr.message }), { status: 500 });

    // por tipo
    async function countBy(at: AccountType) {
      const { count, error } = await applyFilters(
        admin.from("profiles").select("id", { count: "exact", head: true }).eq("account_type", at)
      );
      if (error) throw new Error(error.message);
      return count || 0;
    }
    let byType: Record<AccountType, number> = { admin: 0, instructor: 0, company: 0, student: 0 };
    try {
      const [cAdmin, cInstr, cComp, cStud] = await Promise.all([
        countBy("admin"),
        countBy("instructor"),
        countBy("company"),
        countBy("student"),
      ]);
      byType = { admin: cAdmin, instructor: cInstr, company: cComp, student: cStud };
    } catch (e: any) {
      return new Response(JSON.stringify({ error: "db_error", detail: e?.message || String(e) }), { status: 500 });
    }

    // 6) Listado paginado
    let listQ = admin
      .from("profiles")
      .select("id, email, full_name, rut, company_name, account_type, phone, created_at, updated_at", { count: "exact" });

    listQ = applyFilters(listQ)
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    const { data: items, count: listCount, error: listErr } = await listQ;
    if (listErr) return new Response(JSON.stringify({ error: "db_error", detail: listErr.message }), { status: 500 });

    // 7) CSV opcional
    if (format === "csv") {
      const rows = items || [];
      const header = ["id","email","full_name","rut","company_name","account_type","phone","created_at","updated_at"];
      const lines = [header.join(",")];
      for (const r of rows) {
        const line = [
          r.id,
          r.email ?? "",
          (r.full_name ?? "").replaceAll(",", " "),
          r.rut ?? "",
          (r.company_name ?? "").replaceAll(",", " "),
          r.account_type ?? "",
          (r.phone ?? "").replaceAll(",", " "),
          r.created_at ?? "",
          r.updated_at ?? "",
        ].map(v => `"${String(v).replaceAll(`"`, `""`)}"`).join(",");
        lines.push(line);
      }
      const csv = lines.join("\n");
      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=usuarios.csv",
        },
      });
    }

    // 8) JSON (KPIs + lista)
    return Response.json({
      kpi: {
        total: totalCount || 0,
        nuevos_30d: new30 || 0,
        por_tipo: byType,
      },
      page,
      pageSize,
      total: listCount || 0,
      items: items || [],
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: "unexpected", detail: e?.message || String(e) }), { status: 500 });
  }
}
