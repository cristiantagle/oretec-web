// app/api/public/courses/route.ts
import { supabaseServer } from '@/lib/supabase/server'

/**
 * Devuelve cursos públicos desde BD (sin mocks), normalizados para la UI:
 * { id, title, code, hours, price_clp, description, buy_url, image_url, mp_links_by_qty, created_at, updated_at }
 *
 * Por defecto NO filtra por flags. Si agregas ?onlyPublished=1 filtra por published/is_active/visible === true.
 */
export async function GET(req: Request) {
  const db = supabaseServer()

  const { searchParams } = new URL(req.url)
  const onlyPublished = searchParams.get('onlyPublished') === '1'

  const { data, error } = await db
  .from('courses') // 👈 ajusta si tu tabla se llama distinto
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

  // Normalización
  let normalized = rows.map((r: any) => {
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
    // flags crudos por si luego los quieres usar
    published: typeof r.published === 'boolean' ? r.published : undefined,
    is_active: typeof r.is_active === 'boolean' ? r.is_active : undefined,
    visible: typeof r.visible === 'boolean' ? r.visible : undefined,
  }
  })

  // Filtro opcional por flags (solo si se pide)
  if (onlyPublished) {
    normalized = normalized.filter((r: any) => {
      const flags: boolean[] = []
      if (typeof r.published === 'boolean') flags.push(r.published)
        if (typeof r.is_active === 'boolean') flags.push(r.is_active)
          if (typeof r.visible === 'boolean') flags.push(r.visible)
            return flags.length ? flags.every(Boolean) : true
    })
  }

  return Response.json(normalized)
}
