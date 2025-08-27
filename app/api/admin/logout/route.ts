import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const res = NextResponse.redirect(new URL("/", req.url));
    res.cookies.set("admin_auth", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(0),
    });
    return res;
}
export async function GET(req: Request) { return POST(req); }
