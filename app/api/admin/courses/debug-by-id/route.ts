import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function isAuthorized(req: Request): boolean {
    const c = cookies().get('admin_auth')?.value
    if (c === '1') return true
        const auth = req.headers.get('authorization') || ''
        if (auth && process.env.ADMIN_TOKEN && auth === `Bearer ${process.env.ADMIN_TOKEN}`) return true
            return false
}

export async function GET(req: Request) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const u = new URL(req.url)
    const id = (u.searchParams.get('id') || '').trim()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

        const sb = supabaseServer()
        const { data, error } = await sb
        .from('courses')
        .select('id, code, slug, title, published, mp_link, hours, price_cents')
        .eq('id', id)
        .limit(1)

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
            return NextResponse.json({ count: data?.length ?? 0, row: data?.[0] ?? null })
}
