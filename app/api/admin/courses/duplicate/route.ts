import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseServer } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'

function slugify(s: string) {
    return s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
}
function nextUnique(base: string, taken: Set<string>) {
    let cand = `${base}-copy`
    let i = 2
    while (taken.has(cand)) cand = `${base}-copy-${i++}`
        return cand
}

export async function POST(req: Request) {
    try {
        const admin = cookies().get('admin_auth')?.value === '1'
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            const body = await req.json()
            const id = String(body.id || '').trim()
            if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

                const supabase = supabaseServer()
                const { data: original, error: getErr } = await supabase
                .from('courses')
                .select('id, code, slug, title, description, price_cents, hours, level, mp_link, published')
                .eq('id', id).single()
                if (getErr || !original) return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 })

                    const { data: allCodes } = await supabase.from('courses').select('code')
                    const { data: allSlugs } = await supabase.from('courses').select('slug')
                    const codes = new Set((allCodes ?? []).map(r => (r.code || '').toString().toLowerCase()))
                    const slugs = new Set((allSlugs ?? []).map(r => (r.slug || '').toString().toLowerCase()))

                    const baseCode = (original.code || 'curso').toString().toLowerCase()
                    const baseSlug = (original.slug || slugify(original.title || baseCode)).toString().toLowerCase()

                    const newCode = nextUnique(baseCode, codes).toUpperCase()
                    const newSlug = nextUnique(baseSlug, slugs)

                    const { data: created, error: insErr } = await supabase
                    .from('courses')
                    .insert({
                        code: newCode,
                        slug: newSlug,
                        title: original.title ? `${original.title} (copia)` : 'Curso (copia)',
                            description: original.description ?? null,
                            price_cents: original.price_cents ?? null,
                            hours: original.hours ?? null,
                            level: original.level ?? 'Básico',
                            mp_link: original.mp_link ?? null,
                            published: false,
                    })
                    .select('id, code, slug, title, description, price_cents, hours, level, mp_link, published')
                    .single()

                    if (insErr || !created) return NextResponse.json({ error: 'No se pudo duplicar' }, { status: 500 })
                        return NextResponse.json({ course: created }, { status: 201 })
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
    }
}
