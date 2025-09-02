// app/api/public/courses/route.ts
import { supabaseServer } from '@/lib/supabase/server'

/**
 * Devuelve cursos públicos desde la BD (sin mocks), normalizados para la UI:
 * { id, title, code, hours, price_clp, description, buy_url, image_url, mp_links_by_qty, created_at, updated_at }
 *
 * Lee con select('*') y tolera nombres alternativos de campos.
 */
export async function GET() {
  const db = supabaseServer()

  // Traemos todo y normalizamos en memoria (evita dolores con columnas opcionales).
  const { data, error } = await db
  .from('courses')            // 👈 ajusta el nombre de la tabla si es distinto
  .select('*')
  .order('updated_at', { ascending: false })

  if (error) {
    return new Response(
      JSON.stringify({ error: 'db_error', detail: error.message }),
                        { status: 500 },
    )
  }

  const rows = Array.isArray(data) ? data : []

  // Helpers
  const firstOf = (obj: any, keys: string[]): any => {
    for (const k of keys) {
      if (!obj) continue
        if (k.includes('->')) {
          // JSON path simple: links->buy
          const [root, sub] = k.split('->')
          const v = obj?.[root]?.[sub]
          if (v != null) return v
        } else if (k in obj && obj[k] != null) {
          return obj[k]
        }
    }
    return null
  }
  const toHours = (v: any): number | null => {
    if (v == null) return null
      if (typeof v === 'number' && Number.isFinite(v)) return Math.round(v)
        if (typeof v === 'string') {
          const m = v.match(/(\d{1,3})/)
          if (m) return parseInt(m[1], 10)
        }
        return null
  }
  const toPriceCLP = (v: any): number | null => {
    if (v == null) return null
      if (typeof v === 'number') return Math.round(v)
        if (typeof v === 'string') {
          const digits = v.replace(/[^\d]/g, '')
          if (!digits) return null
            const n = parseInt(digits, 10)
            return Number.isFinite(n) ? n : null
        }
        return null
  }

  const normalized = rows
  // Si tienes flags de visibilidad, los respetamos si existen
  .filter((r: any) => {
    const flags = [r.published, r.is_active, r.visible].filter(v => typeof v === 'boolean')
    return flags.length ? flags.every(Boolean) : true
  })
  .map((r: any) => {
    const title = firstOf(r, ['title', 'course_title', 'name', 'nombre', 'titulo']) ?? 'Curso'
  const code = firstOf(r, ['code', 'course_code', 'sku', 'slug', 'codigo'])
  const hours = toHours(firstOf(r, ['hours', 'duration_hours', 'duration', 'duracion', 'hrs']))
  const price_clp = toPriceCLP(firstOf(r, ['price_clp', 'price', 'price_cents']))
  const description = firstOf(r, ['description', 'summary', 'desc', 'descripcion', 'resumen'])
  const buy_url = firstOf(r, ['buy_url', 'mp_url', 'mp_link', 'payment_link', 'checkout_url', 'links->buy', 'links->checkout'])
  const image_url = firstOf(r, ['image_url', 'cover', 'thumbnail'])

  return {
    id: r.id,
    title,
    code,
    hours,
    price_clp,
    description,
    buy_url,
    image_url,
    mp_links_by_qty: r.mp_links_by_qty ?? null,
    created_at: r.created_at ?? null,
    updated_at: r.updated_at ?? null,
    _raw: r, // por si luego quieres algo extra en la tarjeta
  }
  })

  return Response.json(normalized)
}
