import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function isAuthorized(req: Request): boolean {
    const c = cookies().get('admin_auth')?.value
    if (c === '1') return true
        const auth = req.headers.get('authorization') || ''
        if (auth && process.env.ADMIN_TOKEN && auth === `Bearer ${process.env.ADMIN_TOKEN}`) return true
            const x = req.headers.get('x-admin-token') || ''
            if (x && process.env.ADMIN_TOKEN && x === process.env.ADMIN_TOKEN) return true
                return false
}

export async function GET(req: Request) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const u = new URL(req.url)
    const id = (u.searchParams.get('id') || '').trim()
    const slug = (u.searchParams.get('slug') || '').trim()
    const code = (u.searchParams.get('code') || '').trim()

    if (!id && !slug && !code) {
        return NextResponse.json({ error: 'Provide id OR slug OR code' }, { status: 400 })
    }

    const sb = supabaseServer()
    const { data, error } = await sb
    .from('courses')
    .select('id, code, slug, title, published')
    .or([
        id ? `id.eq.${id}` : '',
        slug ? `slug.eq.${slug}` : '',
        code ? `code.eq.${code}` : '',
    ].filter(Boolean).join(','))
    .order('title', { ascending: true })
    .limit(20)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
        matches: data ?? [],
        count: data?.length ?? 0,
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL || '(missing)',
    }, {
        headers: {
            'Cache-Control': 'no-store',
            'CDN-Cache-Control': 'no-store',
            'Vercel-CDN-Cache-Control': 'no-store',
        },
    })
}
