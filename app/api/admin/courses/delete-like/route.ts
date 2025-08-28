import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseServer } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'

function ok(req: Request) {
    const c = cookies().get('admin_auth')?.value
    if (c === '1') return true
        const auth = req.headers.get('authorization') || ''
        return !!(auth && process.env.ADMIN_TOKEN && auth === `Bearer ${process.env.ADMIN_TOKEN}`)
}

export async function POST(req: Request) {
    if (!ok(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const body = await req.json().catch(() => ({} as any))
        const q = (body?.q as string | undefined)?.trim()
        if (!q) return NextResponse.json({ error: 'Missing q' }, { status: 400 })

            const sb = supabaseServer()
            const { data: found, error: e1 } = await sb
            .from('courses')
            .select('id')
            .or([
                `slug.ilike.%${q}%`,
                `code.ilike.%${q}%`,
                `title.ilike.%${q}%`,
                `description.ilike.%${q}%`,
            ].join(','))
            .limit(200)

            if (e1) return NextResponse.json({ error: e1.message }, { status: 500 })
                if (!found?.length) return NextResponse.json({ ok: true, deleted: 0, ids: [] })

                    const ids = found.map(r => r.id)
                    const { data: del, error: e2 } = await sb
                    .from('courses')
                    .delete()
                    .in('id', ids)
                    .select('id')

                    if (e2) return NextResponse.json({ error: e2.message }, { status: 500 })
                        return NextResponse.json({ ok: true, deleted: del?.length ?? 0, ids })
}
