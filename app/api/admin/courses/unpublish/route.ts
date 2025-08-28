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

export async function POST(req: Request) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({} as any))
    const id = (body?.id as string | undefined)?.trim()
    const slug = (body?.slug as string | undefined)?.trim()
    const code = (body?.code as string | undefined)?.trim()

    if (!id && !slug && !code) {
        return NextResponse.json({ error: 'Provide id OR slug OR code' }, { status: 400 })
    }

    const sb = supabaseServer()

    // Selecciona primero para ver si existe
    const { data: rows, error: selErr } = await sb
    .from('courses')
    .select('id, code, slug, title, published')
    .or([
        id ? `id.eq.${id}` : '',
        slug ? `slug.eq.${slug}` : '',
        code ? `code.eq.${code}` : '',
    ].filter(Boolean).join(','))
    .limit(10)

    if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 })
        if (!rows || rows.length === 0) {
            return NextResponse.json({ ok: true, updated: 0, found: [] })
        }

        // Despublica todas las coincidencias (conservador y efectivo)
        const { data: upd, error: updErr } = await sb
        .from('courses')
        .update({ published: false })
        .or([
            id ? `id.eq.${id}` : '',
            slug ? `slug.eq.${slug}` : '',
            code ? `code.eq.${code}` : '',
        ].filter(Boolean).join(',')) // mismo filtro

        .select('id, code, slug, published')

        if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

            return NextResponse.json({
                ok: true,
                updated: upd?.length ?? 0,
                updated_rows: upd ?? [],
                note: 'Soft delete: published=false (ya no aparecerá en /courses)',
            }, {
                headers: {
                    'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
                    'CDN-Cache-Control': 'no-store',
                    'Vercel-CDN-Cache-Control': 'no-store',
                },
            })
}
