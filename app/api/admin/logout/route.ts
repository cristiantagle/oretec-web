import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** POST-Redirect-GET con 303 para evitar 405 en "/" */
export async function POST(req: Request) {
    const res = NextResponse.redirect(new URL("/", req.url), 303); // 303 See Other
    res.cookies.set("admin_auth", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(0),
    });
    return res;
}

/** Permite también GET (por si hay enlaces) */
export async function GET(req: Request) {
    return POST(req);
}
