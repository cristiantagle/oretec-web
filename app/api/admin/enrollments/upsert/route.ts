import { supabaseServer } from "@/lib/supabase/server";

/**
 * Upsert de inscripciones tolerante al esquema.
 * Body:
 *   { user_id: string, course_id?: string, course_code?: string, qty?: number, meta?: Record<string, any> }
 */
export async function POST(req: Request) {
  try {
    const admin = supabaseServer();

    const body = await req.json().catch(() => ({})) as {
      user_id?: string;
      course_id?: string | null;
      course_code?: string | null;
      qty?: number | null;
      meta?: Record<string, any> | null;
    };

    const user_id = (body.user_id || "").trim();
    const course_id = body.course_id?.trim() || null;
    const course_code = body.course_code?.trim() || null;
    const qty = Math.max(1, Number(body.qty ?? 1));
    const meta = body.meta ?? null;

    if (!user_id) {
      return new Response(JSON.stringify({ ok:false, error:"missing_user_id" }), { status: 400 });
    }

    // Inspección de columnas reales
    const { data: probe, error: probeErr } = await admin
      .from("enrollments").select("*").limit(1);
    if (probeErr) {
      return new Response(JSON.stringify({ ok:false, error:"db_probe_err", detail: probeErr.message }), { status: 500 });
    }

    const columns = new Set<string>(Object.keys((probe && probe[0]) || {}));
    const hasCourseCode = columns.has("course_code");
    const hasCourseId   = columns.has("course_id");
    const hasQty        = columns.has("qty");
    const hasStatus     = columns.has("status");
    const hasMeta       = columns.has("meta");

    const payload: Record<string, any> = { user_id };
    if (hasCourseCode && course_code) payload.course_code = course_code;
    if (hasCourseId   && course_id)   payload.course_id   = course_id;
    if (hasQty)                        payload.qty        = qty;
    if (hasStatus)                     payload.status     = "pending";
    if (hasMeta) {
      payload.meta = {
        ...(meta || {}),
        _fallback: {
          ...(course_code ? { course_code } : {}),
          ...(course_id ? { course_id } : {}),
        },
      };
    }

    // Si no hay columnas de curso, igual persistimos y guardamos fallback en meta (si existe)
    if (!hasCourseCode && !hasCourseId) {
      if (hasQty)    payload.qty = qty;
      if (hasStatus) payload.status = "pending";
      if (hasMeta) {
        payload.meta = {
          ...(meta || {}),
          _fallback: {
            ...(course_code ? { course_code } : {}),
            ...(course_id ? { course_id } : {}),
          },
        };
      }
    }

    const { data, error } = await admin
      .from("enrollments")
      .insert(payload)
      .select("*")
      .maybeSingle();

    if (error) {
      return new Response(JSON.stringify({ ok:false, error:"db_insert_err", detail: error.message, payload, columns: Array.from(columns) }), { status: 500 });
    }

    return Response.json({ ok: true, row: data, columns: Array.from(columns) });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok:false, error:"unexpected", detail: e?.message || String(e) }), { status: 500 });
  }
}
