import { supabaseServer } from "@/lib/supabase/server";
import { requireAdmin } from "../../testimonials/_auth";

export async function GET(req: Request) {
  const unauth = requireAdmin();
  if (unauth) return unauth;

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return new Response(JSON.stringify({ error: "Falta id" }), { status: 400 });
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase
  .from("contacts")
  .select("*")
  .eq("id", id)
  .single();

  if (error) {
    return new Response(
      JSON.stringify({ error: "DB error", detail: error.message }),
                        { status: 500 }
    );
  }
  if (!data) {
    return new Response(JSON.stringify({ error: "No encontrado" }), { status: 404 });
  }
  return Response.json(data);
}
