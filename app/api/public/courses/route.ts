// app/api/public/courses/route.ts
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = supabaseServer()

    // Ajusta el nombre de la tabla si es distinto
    const { data, error } = await supabase
    .from('courses')
    .select(`
    id,
    code,
    slug,
    title,
    description,
    price_cents,
    hours,
    level,
    mp_link,
    published
    `)
    .eq('published', true)
    .order('title', { ascending: true })

    if (error) {
      console.error('[public/courses] supabase error:', error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    const normalized = (data ?? []).map((c) => {
      // price en pesos desde cents (si existe)
      const price =
      typeof c.price_cents === 'number'
    ? Math.round(c.price_cents / 100)
    : null

    // Link de compra público
    const mercado_pago_url = c.mp_link || null

    return {
      id: c.id,
      code: c.code,
      slug: c.slug,
      title: c.title,
      description: c.description,
      hours: typeof c.hours === 'number' ? c.hours : null,
      price_cents: typeof c.price_cents === 'number' ? c.price_cents : null,
      price, // CLP (pesos) ya convertido
                                        level: c.level,
                                        mercado_pago_url,
                                        url: mercado_pago_url, // alias por compatibilidad
                                        published: !!c.published,
    }
    })

    return NextResponse.json(normalized, { status: 200 })
  } catch (e: any) {
    console.error('[public/courses] fatal:', e)
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}
