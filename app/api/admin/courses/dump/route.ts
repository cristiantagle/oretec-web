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

function codes(s: any): number[] | null {
    if (s == null) return null
        const str = String(s)
        const arr: number[] = []
        for (const ch of str) arr.push(ch.codePointAt(0)!)
            return arr
}

export async function GET(req: Request) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sb = supabaseServer()
    const { data, error } = await sb
    .from('courses')
    .select('id, code, slug, title, published, price_cents, hours, mp_link')
    .order('title', { ascending: true })
    .limit(1000)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const enriched = (data ?? []).map((r) => {
        const slug = r.slug == null ? null : String(r.slug)
        const code = r.code == null ? null : String(r.code)
        return {
            ...r,
            __meta: {
                slug_raw: slug,
                slug_len: slug?.length ?? null,
                slug_codes: codes(slug),          // <-- códigos unicode (para detectar espacios invisibles)
    code_raw: code,
    code_len: code?.length ?? null,
    code_codes: codes(code),
            },
        }
    })

    return NextResponse.json(
        { count: enriched.length, rows: enriched },
        {
            headers: {
                'Cache-Control': 'no-store',
                'CDN-Cache-Control': 'no-store',
                'Vercel-CDN-Cache-Control': 'no-store',
            },
        }
    )
}
