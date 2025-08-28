import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    const url = new URL(req.url)
    const debug = url.searchParams.get('debug') === '1'
    try {
        const supabase = supabaseServer()
        const { data, error } = await supabase
        .from('courses')
        .select('id, code, slug, title, description, price_cents, hours, level, mp_link, published')
        .order('title', { ascending: true })

        if (error) {
            return NextResponse.json(
                { error: 'DB error', detail: debug ? String(error.message || error) : undefined },
                                     { status: 500 }
            )
        }

        return NextResponse.json(data ?? [], { status: 200, headers: { 'Cache-Control': 'no-store' } })
    } catch (e: any) {
        return NextResponse.json(
            { error: 'Internal error', detail: debug ? String(e?.message || e) : undefined },
                                 { status: 500 }
        )
    }
}
