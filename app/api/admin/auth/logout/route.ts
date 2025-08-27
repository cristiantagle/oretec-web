import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Redirige a la ruta canónica
  return NextResponse.redirect(new URL("/api/admin/logout", req.url), 303);
}
export async function GET(req: Request) {
  return POST(req);
}
