import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseServer } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'

function isAuthorized(req: Request): boolean {
    const c = cookies().get('admin_auth')?.value
    if (c === '1') return true
        const auth = req.headers.get('authorization') || ''
        return !!(auth && process.env.ADMIN_TOKEN && auth === `Bearer ${process.env.ADMIN_TOKEN}`)
}

export async function POST(req: Request) {
    if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const body = await req.json().catch(() => ({} as any))
        const slug = (body?.slug as string | undefined)?.trim()
        if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

            const sb = supabaseServer()
            const { data, error } = await sb
            .from('courses')
            .update({ published: false })
            .eq('slug', slug)
            .select('id, code, slug, published')

            if (error) return NextResponse.json({ error: error.message }, { status: 500 })
                return NextResponse.json({ ok: true, updated: data?.length ?? 0, rows: data ?? [] })
}
