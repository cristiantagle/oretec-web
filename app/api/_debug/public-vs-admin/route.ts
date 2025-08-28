import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const sb = supabaseServer()
        const { data: all, error: e1 } = await sb
        .from('courses').select('id, title, published').order('title', { ascending: true })
        const { data: pub, error: e2 } = await sb
        .from('courses').select('id, title, published').eq('published', true).order('title', { ascending: true })

        if (e1 || e2) {
            return NextResponse.json({ error: 'DB error', detail: String((e1 || e2)?.message || (e1 || e2)) }, { status: 500 })
        }

        return NextResponse.json({
            supabase_url_in_env: process.env.NEXT_PUBLIC_SUPABASE_URL || '(MISSING)',
                                 counts: { total: all?.length ?? 0, published: pub?.length ?? 0 },
                                 sample_all: (all || []).slice(0, 10),
                                 sample_published: (pub || []).slice(0, 10),
        })
    } catch (e: any) {
        return NextResponse.json({ error: 'fatal', detail: String(e?.message || e) }, { status: 500 })
    }
}
