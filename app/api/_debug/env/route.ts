import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export async function GET() {
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasService = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    const hasAnon = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    return NextResponse.json({
        NEXT_PUBLIC_SUPABASE_URL: hasUrl ? 'OK' : 'MISSING',
        SUPABASE_SERVICE_ROLE_KEY: hasService ? 'OK' : 'MISSING',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: hasAnon ? 'OK' : 'MISSING',
    })
}
