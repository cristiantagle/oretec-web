import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protege /admin con tu cookie admin_auth
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const isAuth = req.cookies.get("admin_auth")?.value === "1";
    if (!isAuth) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
