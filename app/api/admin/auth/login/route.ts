import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ok: true, method: "GET" });
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204 });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any));
  const provided = body?.token ?? body?.password ?? "";
  const expected = process.env.ADMIN_TOKEN;

  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_TOKEN no configurado" },
      { status: 500 }
    );
  }

  if (provided !== expected) {
    return NextResponse.json(
      { ok: false, error: "Credenciales inválidas" },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true, next: body?.next || "/admin" });
  res.cookies.set("admin_auth", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8h
  });
  return res;
}
