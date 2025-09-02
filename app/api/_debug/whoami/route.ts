import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const raw = req.headers.get("authorization") ?? req.headers.get("Authorization");
    if (!raw) return new Response(JSON.stringify({ error: "missing_bearer" }), { status: 401 });
    const token = raw.startsWith("Bearer ") ? raw.slice("Bearer ".length) : raw;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) return new Response(JSON.stringify({ error: "missing_supabase_env" }), { status: 500 });

    const asUser = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: udata, error: uerr } = await asUser.auth.getUser();
    if (uerr || !udata?.user) return new Response(JSON.stringify({ error: "invalid_session" }), { status: 401 });

    const admin = supabaseServer();
    const { data: prof } = await admin
      .from("profiles")
      .select("*")
      .eq("id", udata.user.id)
      .maybeSingle();

    const email = (udata.user.email || (udata.user.user_metadata as any)?.email || null);
    return Response.json({
      email,
      id: udata.user.id,
      account_type: prof?.account_type ?? null,
      profile: prof ?? null,
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: "unexpected", detail: e?.message || String(e) }), { status: 500 });
  }
}
