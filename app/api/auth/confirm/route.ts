import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * POST /api/auth/confirm
 * Llamado después de que el usuario hace clic en el correo de verificación.
 * Crea el perfil si no existe.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user } = body;

    if (!user || !user.id) {
      return NextResponse.json({ error: "Usuario inválido" }, { status: 400 });
    }

    const admin = supabaseServer();
    const { data, error } = await admin
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "DB error", detail: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      const { error: insErr } = await admin.from("profiles").insert([
        {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name ?? null,
          account_type: user.user_metadata?.account_type ?? "student",
          company_name: user.user_metadata?.company_name ?? null,
        },
      ]);
      if (insErr) {
        return NextResponse.json(
          { error: "DB insert error", detail: insErr.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Error inesperado" },
      { status: 500 }
    );
  }
}
