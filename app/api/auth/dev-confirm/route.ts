import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  if (process.env.ALLOW_DEV_EMAIL_BYPASS !== "true") {
    return NextResponse.json({ error: "disabled" }, { status: 403 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    return NextResponse.json(
      { error: "missing_env", detail: "SUPABASE_URL or SERVICE_ROLE" },
      { status: 500 }
    );
  }

  const { email, full_name, account_type, company_name } = await req.json().catch(() => ({} as any));
  if (!email) {
    return NextResponse.json({ error: "email_required" }, { status: 400 });
  }

  const admin = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: usersList, error: listErr } = await admin.auth.admin.listUsers();
  if (listErr) {
    return NextResponse.json({ error: "admin_list_err", detail: listErr.message }, { status: 500 });
  }
  const user = usersList.users.find(u => (u.email || "").toLowerCase() === String(email).toLowerCase());
  if (!user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  const { data: upd, error: updErr } = await admin.auth.admin.updateUserById(user.id, {
    email_confirm: true,
    user_metadata: {
      ...(user.user_metadata || {}),
      full_name: full_name ?? user.user_metadata?.full_name ?? null,
      account_type: account_type ?? user.user_metadata?.account_type ?? "student",
      company_name: company_name ?? user.user_metadata?.company_name ?? null,
    },
  });
  if (updErr) {
    return NextResponse.json({ error: "admin_update_err", detail: updErr.message }, { status: 500 });
  }

  const { data: profSel, error: selErr } = await admin
    .from("profiles")
    .select("*")
    .eq("id", upd.user.id)
    .maybeSingle();
  if (selErr) {
    return NextResponse.json({ error: "db_select_err", detail: selErr.message }, { status: 500 });
  }

  const now = new Date().toISOString();
  if (!profSel) {
    const insertPayload: Record<string, any> = {
      id: upd.user.id,
      email: upd.user.email,
      full_name: full_name ?? upd.user.user_metadata?.full_name ?? null,
      account_type: account_type ?? upd.user.user_metadata?.account_type ?? "student",
      company_name: company_name ?? upd.user.user_metadata?.company_name ?? null,
      updated_at: now,
    };
    const { data: ins, error: insErr } = await admin.from("profiles").insert(insertPayload).select("*").single();
    if (insErr) {
      return NextResponse.json({ error: "db_insert_err", detail: insErr.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, confirmed: true, created_profile: true, profile: ins });
  } else {
    const patch: Record<string, any> = {};
    if (profSel.email == null) patch.email = upd.user.email;
    if (profSel.full_name == null && full_name) patch.full_name = full_name;
    if (profSel.account_type == null && account_type) patch.account_type = account_type;
    if (profSel.company_name == null && company_name) patch.company_name = company_name;

    if (Object.keys(patch).length > 0) {
      patch.updated_at = now;
      const { data: up, error: upErr } = await admin
        .from("profiles")
        .update(patch)
        .eq("id", upd.user.id)
        .select("*")
        .single();
      if (upErr) {
        return NextResponse.json({ error: "db_update_err", detail: upErr.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true, confirmed: true, created_profile: false, profile: up });
    }

    return NextResponse.json({ ok: true, confirmed: true, created_profile: false, profile: profSel });
  }
}
