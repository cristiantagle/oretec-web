import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function POST() {
    const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const res = NextResponse.redirect(new URL("/admin/login", site));
    res.cookies.set("admin_auth","",{
        httpOnly:true, secure:process.env.NODE_ENV==="production",
        sameSite:"lax", path:"/", expires:new Date(0),
    });
    return res;
}
export async function GET() { return POST(); }
