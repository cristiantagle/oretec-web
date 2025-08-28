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

export async function GET(req: Request) {
    if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const u = new URL(req.url)
        const slug = (u.searchParams.get('slug') || '').trim()
        const code = (u.searchParams.get('code') || '').trim()
        if (!slug && !code) return NextResponse.json({ error: 'Provide slug or code' }, { status: 400 })

            const sb = supabaseServer()
            let q = sb.from('courses').select('id, code, slug, title, published').order('title', { ascending: true })
            if (slug) q = q.eq('slug', slug)
                if (code) q = q.eq('code', code)

                    const { data, error } = await q
                    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
                        return NextResponse.json({ count: data?.length ?? 0, rows: data ?? [] })
}
