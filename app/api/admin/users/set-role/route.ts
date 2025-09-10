import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

type Role = "admin" | "instructor" | "company" | "student";

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

export async function POST(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) {
      return new Response(JSON.stringify({ error: "missing_env" }), { status: 500 });
    }

    const { userId, role } = await req.json().catch(() => ({ userId: "", role: "" }));
    const newRole = (String(role || "").toLowerCase() as Role) || "student";
    const allowed: Role[] = ["admin", "instructor", "company", "student"];
    if (!userId || !allowed.includes(newRole)) {
      return new Response(JSON.stringify({ error: "bad_request" }), { status: 400 });
    }

    // Autorización: cookie superadmin o bearer admin
    const cookies = parseCookies(req.headers.get("cookie"));
    const hasSuperadmin = cookies["admin_auth"] === "1";

    let requesterIsAdmin = false;

    if (hasSuperadmin) {
      requesterIsAdmin = true;
    } else {
      const raw = req.headers.get("authorization") ?? req.headers.get("Authorization");
      if (!raw) return new Response(JSON.stringify({ error: "not_authenticated" }), { status: 401 });
      const authHeader = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;

      const asUser = createClient(url, anon, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data: userData, error: userErr } = await asUser.auth.getUser();
      if (userErr || !userData?.user) {
        return new Response(JSON.stringify({ error: "invalid_session" }), { status: 401 });
      }
      const srv = supabaseServer();
      const { data: me, error: meErr } = await srv
        .from("profiles")
        .select("id, account_type")
        .eq("id", userData.user.id)
        .maybeSingle();
      if (meErr) return new Response(JSON.stringify({ error: "db_error", detail: meErr.message }), { status: 500 });
      if (!me || me.account_type !== "admin") {
        return new Response(JSON.stringify({ error: "forbidden" }), { status: 403 });
      }
      requesterIsAdmin = true;
    }

    if (!requesterIsAdmin) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403 });

    const admin = supabaseServer();
    const { data, error } = await admin
      .from("profiles")
      .update({ account_type: newRole, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select("id, account_type")
      .maybeSingle();

    if (error) {
      return new Response(JSON.stringify({ error: "db_error", detail: error.message }), { status: 500 });
    }

    return Response.json({ ok: true, userId, account_type: data?.account_type ?? newRole });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: "unexpected", detail: e?.message || String(e) }), { status: 500 });
  }
}
