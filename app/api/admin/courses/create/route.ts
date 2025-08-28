import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseServer } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'

function slugify(s: string) {
    return s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
}
function toInt(v: any): number | null {
    if (v == null) return null
        if (typeof v === 'number' && Number.isFinite(v)) return Math.round(v)
            if (typeof v === 'string') {
                const d = v.replace(/[^\d]/g, ''); if (!d) return null
                const n = parseInt(d, 10); return Number.isFinite(n) ? n : null
            }
            return null
}

export async function POST(req: Request) {
    try {
        const admin = cookies().get('admin_auth')?.value === '1'
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

            const body = await req.json()
            const code = String(body.code || '').trim()
            const title = String(body.title || '').trim()
            if (!code || !title) return NextResponse.json({ error: 'code y title son obligatorios' }, { status: 400 })

                const pricePesos = toInt(body.price_clp)
                const hoursNum = toInt(body.hours)
                const level = String(body.level || 'Básico')
                const mp_link = body.mp_link ? String(body.mp_link) : null
                const description = body.description ? String(body.description) : null
                const published = !!body.published
                const slug = slugify(body.slug || code || title)

                const supabase = supabaseServer()
                if ((await supabase.from('courses').select('id').eq('code', code).limit(1)).data?.length) {
                    return NextResponse.json({ error: 'Ya existe un curso con ese código' }, { status: 409 })
                }
                if ((await supabase.from('courses').select('id').eq('slug', slug).limit(1)).data?.length) {
                    return NextResponse.json({ error: 'Ya existe un curso con ese slug' }, { status: 409 })
                }

                const { data, error } = await supabase
                .from('courses')
                .insert({
                    code, slug, title, description,
                    price_cents: typeof pricePesos === 'number' ? pricePesos : null, // PESOS
                    hours: typeof hoursNum === 'number' ? hoursNum : null,
                    level, mp_link, published,
                })
                .select('id, code, slug, title, description, price_cents, hours, level, mp_link, published')
                .single()

                if (error) return NextResponse.json({ error: 'No se pudo crear' }, { status: 500 })
                    return NextResponse.json({ course: data }, { status: 201 })
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
    }
}
