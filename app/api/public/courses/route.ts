import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function isPublished(v: any) {
  return v === true || v === 'true' || v === 1 || v === '1'
}

function nocache() {
  return {
    'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
    'CDN-Cache-Control': 'no-store',
    'Vercel-CDN-Cache-Control': 'no-store',
  }
}

/**
 * ⚠️ Parche temporal anti-fantasmas
 * Quita PRLL2 de la salida pública mientras investigamos la causa raíz.
 * Puedes quitar este bloque cuando verifique que la DB quedó consistente.
 */
const BLACKLIST = {
  ids:   new Set<string>(['7b677037-63d0-434e-9e53-b6f4492a8dbc']),
  slugs: new Set<string>(['prll2']),
  codes: new Set<string>(['PRLL2']),
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const debug = url.searchParams.get('debug') === '1'

  try {
    const sb = supabaseServer()
    const { data, error } = await sb
    .from('courses')
    .select('id, code, slug, title, description, price_cents, hours, level, mp_link, published')
    .order('title', { ascending: true })

    if (error) {
      return NextResponse.json(
        debug ? { error: 'DB error', detail: String(error.message || error) } : { error: 'DB error' },
                               { status: 500, headers: nocache() }
      )
    }

    const onlyPublished = (data ?? []).filter((c: any) => isPublished(c?.published))

    // Parche: esconder fantasma por id/slug/code
    const sanitized = onlyPublished.filter((c: any) => {
      const id   = String(c?.id ?? '')
      const slug = String(c?.slug ?? '').toLowerCase().trim()
      const code = String(c?.code ?? '').trim()
      if (BLACKLIST.ids.has(id)) return false
        if (BLACKLIST.slugs.has(slug)) return false
          if (BLACKLIST.codes.has(code)) return false
            return true
    })

    const normalized = sanitized.map((c: any) => ({
      id: c.id,
      code: c.code,
      slug: c.slug,
      title: c.title,
      description: c.description,
      hours: typeof c.hours === 'number' ? c.hours : null,
      price_cents: typeof c.price_cents === 'number' ? c.price_cents : null, // PESOS
      price: typeof c.price_cents === 'number' ? c.price_cents : null,
      level: c.level,
      mercado_pago_url: c.mp_link || null,
      url: c.mp_link || null,
      published: c.published,
    }))

    // En modo debug te doy info adicional para comparar con /api/admin/courses/dump
    if (debug) {
      const rawIds = (data ?? []).map((r: any) => r?.id)
      const publicIds = normalized.map((r: any) => r?.id)
      return NextResponse.json(
        {
          debug: true,
          raw_count: data?.length ?? 0,
          raw_ids: rawIds,
          published_count: onlyPublished.length,
          public_count: normalized.length,
            public_ids: publicIds,
              note: 'Blacklist temporal aplicado si coincidía.',
        },
        { headers: { ...nocache(), 'Content-Type': 'application/json' } }
      )
    }

    return new NextResponse(JSON.stringify(normalized), {
      status: 200,
      headers: { ...nocache(), 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    return NextResponse.json(
      debug ? { error: 'Internal error', detail: String(e?.message || e) } : { error: 'Internal error' },
                             { status: 500, headers: nocache() }
    )
  }
}
