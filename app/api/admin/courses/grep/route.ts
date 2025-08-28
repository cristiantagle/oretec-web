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

export async function GET(req: Request) {
    if (!ok(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const u = new URL(req.url)
        const q = (u.searchParams.get('q') || '').trim()
        if (!q) return NextResponse.json({ error: 'Missing q' }, { status: 400 })

            const sb = supabaseServer()
            // Buscamos por varias columnas con ILIKE (contiene, case-insensitive)
            const patterns = [`%${q}%`]
            const { data, error } = await sb
            .from('courses')
            .select('id, code, slug, title, published')
            .or([
                `slug.ilike.${patterns[0]}`,
                `code.ilike.${patterns[0]}`,
                `title.ilike.${patterns[0]}`,
                `description.ilike.${patterns[0]}`,
            ].join(',')) // cualquiera que contenga q
            .order('title', { ascending: true })
            .limit(50)

            if (error) return NextResponse.json({ error: error.message }, { status: 500 })
                return NextResponse.json({ count: data?.length ?? 0, rows: data ?? [] })
}
