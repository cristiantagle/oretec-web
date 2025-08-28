import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseServer } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
const toInt = (v: any) => {
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
            const id = String(body.id || '').trim()
            if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

                const payload: Record<string, any> = {}
                if (body.code != null) payload.code = String(body.code).trim()
                    if (body.title != null) payload.title = String(body.title)
                        if (body.description != null) payload.description = body.description === '' ? null : String(body.description)
                            if (body.level != null) payload.level = String(body.level)
                                if (body.mp_link != null) payload.mp_link = body.mp_link ? String(body.mp_link) : null
                                    if (body.published != null) payload.published = !!body.published
                                        if (body.price_cents != null) payload.price_cents = toInt(body.price_cents) // PESOS
                                            if (body.hours != null) payload.hours = toInt(body.hours)

                                                if (Object.keys(payload).length === 0) return NextResponse.json({ error: 'Nada para actualizar' }, { status: 400 })

                                                    const supabase = supabaseServer()
                                                    const { data, error } = await supabase
                                                    .from('courses')
                                                    .update(payload)
                                                    .eq('id', id)
                                                    .select('id, code, slug, title, description, price_cents, hours, level, mp_link, published')
                                                    .single()

                                                    if (error) return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 500 })
                                                        return NextResponse.json({ course: data }, { status: 200 })
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
    }
}
