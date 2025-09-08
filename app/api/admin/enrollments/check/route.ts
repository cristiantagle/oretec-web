// app/api/admin/enrollments/check/route.ts
import { supabaseServer } from "@/lib/supabase/server";

// Intenta un select con ese set de columnas; si cae por columna inexistente, devuelve {ok:false, error}
async function trySelect(cols: string[]) {
  const db = supabaseServer();
  const sel = cols.join(",");
  const { data, error } = await db
    .from("enrollments")
    .select(sel)
    // Probamos ordenar por created_at si existe; si no, lo reintentamos sin ordenar
    .order("created_at", { ascending: false })
    .limit(5);

  if (error?.message && /column .*created_at.* does not exist/i.test(error.message)) {
    const alt = await db.from("enrollments").select(sel).order("id", { ascending: false }).limit(5);
    return alt;
  }
  return { data, error };
}

export async function GET() {
  try {
    // Conjuntos de columnas a probar en orden (desde las más “ricas” a las más mínimas)
    const candidates: string[][] = [
      ["id","user_id","course_code","status","created_at"],
      ["id","user_id","course_id","status","created_at"],
      ["id","user_id","course_code","created_at"],
      ["id","user_id","course_id","created_at"],
      ["id","user_id","created_at"],
      ["id","user_id"],
      ["id"],
    ];

    let data: any[] | null = null;
    let lastErr: any = null;

    for (const cols of candidates) {
      const res = await trySelect(cols);
      if (!res.error) {
        data = res.data || [];
        // Normalizamos resultados a un shape estable, con null si no existe
        const norm = (data || []).map((r: any) => ({
          id: r.id ?? null,
          user_id: r.user_id ?? null,
          course_code: r.course_code ?? null,
          course_id: r.course_id ?? null,
          status: r.status ?? null,
          created_at: r.created_at ?? null,
        }));
        return Response.json({ ok: true, items: norm, columns_used: cols });
      }
      lastErr = res.error;
      // Si el error NO es por columnas inexistentes, salimos ya
      if (!/column .* does not exist/i.test(res.error.message || "")) {
        break;
      }
    }

    return new Response(
      JSON.stringify({
        ok: false,
        error: "db_error",
        detail: lastErr?.message || "No fue posible seleccionar columnas conocidas.",
      }),
      { status: 500 }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ ok: false, error: "unexpected", detail: e?.message || String(e) }),
      { status: 500 }
    );
  }
}
