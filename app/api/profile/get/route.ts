import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * GET /api/profile/get
 * Devuelve el perfil normalizado del usuario autenticado.
 * Incluye phone, avatar_url, email y campos extra.
 */
export async function GET(req: Request) {
  // 1) Authorization del usuario
  const raw = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!raw) {
    return new Response(
      JSON.stringify({ error: "No autenticado (falta Authorization header)" }),
                        { status: 401 }
    );
  }
  const authHeader = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return new Response(
      JSON.stringify({ error: "Faltan variables de entorno de Supabase" }),
                        { status: 500 }
    );
  }

  // Cliente atado al token del usuario para obtener su UID
  const supabaseUser = createClient(url, anon, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userErr } = await supabaseUser.auth.getUser();
  if (userErr || !userData?.user) {
    return new Response(JSON.stringify({ error: "No autenticado" }), { status: 401 });
  }
  const user = userData.user;

  // 2) Leer perfil con service role (evita RLS) y tolerar columnas
  const admin = supabaseServer();
  const { data, error } = await admin
  .from("profiles")
  .select("*")
  .eq("id", user.id)
  .maybeSingle();

  if (error) {
    return new Response(
      JSON.stringify({ error: "DB error", detail: error.message }),
                        { status: 500 }
    );
  }
  if (!data) {
    return new Response(JSON.stringify({ error: "not_found" }), { status: 404 });
  }

  // 3) Normalización (incluye email y campos extra)
  const normalized = {
    id: data.id,
    email: data.email ?? null,
    full_name:
    data.full_name ?? data.name ?? data.display_name ?? data.fullName ?? null,
    account_type: (data.account_type ?? data.type ?? "student") as
    | "admin"
    | "instructor"
    | "company"
    | "student",
    company_name: data.company_name ?? data.company ?? null,
    phone: data.phone ?? null,
    avatar_url: data.avatar_url ?? null,

    // nuevos
    rut: data.rut ?? null,
    address: data.address ?? null,
    birth_date: data.birth_date ?? null, // 'YYYY-MM-DD'
    nationality: data.nationality ?? null,
    profession: data.profession ?? null,

    created_at: data.created_at ?? null,
    updated_at: data.updated_at ?? data.updatedAt ?? null,
  };

  return Response.json(normalized);
}
