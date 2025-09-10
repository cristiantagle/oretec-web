import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const c = cookies();
    const superCookie = c.get("admin_auth")?.value === "1";

    const body = await req.json().catch(() => ({}));
    const id: string | undefined = body.id ?? body.userId ?? body.uid;
    const roleInput: string | undefined =
      body.role ?? body.account_type ?? body.type ?? body.newRole;

    if (!id || !roleInput) {
      return new Response(
        JSON.stringify({ error: "bad_request", detail: "id and role required" }),
        { status: 400 }
      );
    }

    const allowed = new Set(["admin", "instructor", "company", "student"]);
    const role = String(roleInput).toLowerCase();
    if (!allowed.has(role)) {
      return new Response(
        JSON.stringify({ error: "bad_request", detail: "invalid role" }),
        { status: 400 }
      );
    }

    // Autorización: supercookie o bearer con admin
    let authorized = false;
    if (superCookie) {
      authorized = true;
    } else {
      const raw = req.headers.get("authorization") ?? req.headers.get("Authorization");
      if (!raw) return new Response(JSON.stringify({ error: "no_auth" }), { status: 401 });
      const authHeader = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;

      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !anon) {
        return new Response(JSON.stringify({ error: "missing_env" }), { status: 500 });
      }

      const asUser = createClient(url, anon, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data: ud, error: uerr } = await asUser.auth.getUser();
      if (uerr || !ud?.user) {
        return new Response(JSON.stringify({ error: "invalid_session" }), { status: 401 });
      }
      const admin = supabaseServer();
      const { data: me, error: meErr } = await admin
        .from("profiles")
        .select("account_type")
        .eq("id", ud.user.id)
        .maybeSingle();
      if (meErr) {
        return new Response(JSON.stringify({ error: "db_error", detail: meErr.message }), { status: 500 });
      }
      if (me?.account_type === "admin") authorized = true;
    }

    if (!authorized) {
      return new Response(JSON.stringify({ error: "forbidden" }), { status: 403 });
    }

    // Update
    const db = supabaseServer();
    const { data, error } = await db
      .from("profiles")
      .update({ account_type: role, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id,account_type")
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: "db_error", detail: error.message }), { status: 500 });
    }

    return Response.json({ ok: true, user: data });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: "unexpected", detail: e?.message || String(e) }),
      { status: 500 }
    );
  }
}
