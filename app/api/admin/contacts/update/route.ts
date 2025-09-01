import { supabaseServer } from "@/lib/supabase/server";
import { requireAdmin } from "../../testimonials/_auth";

export async function POST(req: Request) {
  const unauth = requireAdmin();
  if (unauth) return unauth;

  const body = await req.json().catch(() => ({}));
  const { id, ...fields } = body || {};
  if (!id) {
    return new Response(JSON.stringify({ error: "Falta id" }), { status: 400 });
  }

  // Aceptamos ambos nombres y normalizamos a admin_notes
  const allowed = ["status", "archived", "admin_notes"];
  const update: Record<string, any> = {};

  // Alias: si viene "notes" desde el front, la mapeamos a "admin_notes"
  if ("notes" in fields && !("admin_notes" in fields)) {
    fields.admin_notes = fields.notes;
  }

  for (const k of allowed) {
    if (k in fields) update[k] = fields[k];
  }

  if (!Object.keys(update).length) {
    return new Response(JSON.stringify({ error: "Sin cambios" }), { status: 400 });
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase
  .from("contacts")
  .update(update)
  .eq("id", id)
  .select()
  .single();

  if (error) {
    return new Response(
      JSON.stringify({ error: "DB error", detail: error.message }),
                        { status: 500 }
    );
  }
  return Response.json({ ok: true, contact: data });
}
