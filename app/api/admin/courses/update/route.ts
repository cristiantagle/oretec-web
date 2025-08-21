import 'server-only'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function supabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Faltan envs de Supabase')
        return createClient(url, key)
}

type Payload = {
    id: string
    title?: string | null
    description?: string | null
    price_cents?: number | string | null
    hours?: number | string | null
    level?: string | null
    mp_link?: string | null
    published?: boolean | null
}

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as Payload
        if (!body?.id) {
            return NextResponse.json({ error: 'id requerido' }, { status: 400 })
        }

        // Sanitizar/parsear numéricos
        const updates: any = {}
        if (body.title !== undefined) updates.title = body.title?.toString().trim() || null
            if (body.description !== undefined) updates.description = body.description?.toString().trim() || null
                if (body.level !== undefined) updates.level = body.level?.toString().trim() || null
                    if (body.mp_link !== undefined) updates.mp_link = body.mp_link?.toString().trim() || null
                        if (body.published !== undefined) updates.published = !!body.published

                            if (body.price_cents !== undefined && body.price_cents !== null && body.price_cents !== '') {
                                const n = Number(body.price_cents)
                                if (!Number.isFinite(n) || n < 0) {
                                    return NextResponse.json({ error: 'price_cents inválido' }, { status: 400 })
                                }
                                updates.price_cents = Math.round(n) // CLP sin decimales
                            }

                            if (body.hours !== undefined && body.hours !== null && body.hours !== '') {
                                const h = Number(body.hours)
                                if (!Number.isFinite(h) || h < 0) {
                                    return NextResponse.json({ error: 'hours inválido' }, { status: 400 })
                                }
                                updates.hours = Math.round(h)
                            }

                            if (Object.keys(updates).length === 0) {
                                return NextResponse.json({ error: 'Nada para actualizar' }, { status: 400 })
                            }

                            const sb = supabaseAdmin()
                            const { data, error } = await sb
                            .from('courses')
                            .update(updates)
                            .eq('id', body.id)
                            .select('id, code, slug, title, description, price_cents, hours, level, mp_link, published')
                            .single()

                            if (error) return NextResponse.json({ error: error.message }, { status: 500 })
                                return NextResponse.json({ ok: true, course: data })
    } catch (e: any) {
        return NextResponse.json({ error: e?.message ?? 'Unknown server error' }, { status: 500 })
    }
}
