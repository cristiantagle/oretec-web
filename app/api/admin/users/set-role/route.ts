import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

type Role = "admin" | "user";

function hasSuperCookie(req: Request) {
  const ck = req.headers.get("cookie") || "";
  return /(?:^|;\s*)admin_auth=1(?:;|$)/.test(ck);
}

export async function POST(req: Request) {
  try {
    const isSuper = hasSuperCookie(req);

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) {
      return new Response(JSON.stringify({ error: "missing_env" }), { status: 500 });
    }

    const { userId, role } = await req.json().catch(() => ({}));
    if (!userId || !role || !["admin", "user"].includes(role)) {
      return new Response(JSON.stringify({ error: "bad_request" }), { status: 400 });
    }

    let allowed = false;

    if (isSuper) {
      allowed = true; // superadmin por cookie
    } else {
      const raw = req.headers.get("authorization") ?? req.headers.get("Authorization");
      if (!raw) return new Response(JSON.stringify({ error: "missing_bearer" }), { status: 401 });
      const authHeader = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
      const asUser = createClient(url, anon, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data: userData } = await asUser.auth.getUser();
      const callerId = userData?.user?.id ?? null;
      if (!callerId) return new Response(JSON.stringify({ error: "invalid_session" }), { status: 401 });

      const admin = supabaseServer();
      const { data: me, error: meErr } = await admin
        .from("profiles")
        .select("id, account_type")
        .eq("id", callerId)
        .maybeSingle();
      if (meErr) {
        return new Response(JSON.stringify({ error: "db_error", detail: meErr.message }), { status: 500 });
      }
      allowed = !!me && me.account_type === "admin";
    }

    if (!allowed) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403 });

    const admin = supabaseServer();
    const { error: updErr } = await admin
      .from("profiles")
      .update({ account_type: role === "admin" ? "admin" : "student" })
      .eq("id", userId);

    if (updErr) {
      return new Response(JSON.stringify({ error: "db_error", detail: updErr.message }), { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: "unexpected", detail: e?.message || String(e) }), { status: 500 });
  }
}
