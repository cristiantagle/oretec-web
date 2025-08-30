// app/api/public/testimonials/route.ts
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const all = url.searchParams.get('all') === '1' // modo debug: devuelve TODO, publicado o no

  const supabase = supabaseServer()
  let query = supabase
  .from('testimonials')
  .select('id, name, role, quote, initials, published, created_at')
  .order('created_at', { ascending: false })

  if (!all) {
    query = query.eq('published', true)
  }

  const { data, error } = await query

  if (error) {
    return new Response(JSON.stringify({ error: 'DB error', detail: error.message }), { status: 500 })
  }

  // modo debug opcional para ver conteos
  if (url.searchParams.get('debug') === '1') {
    return Response.json({
      debug: true,
      all,
      count: data?.length ?? 0,
      ids: (data ?? []).map(d => d.id),
                         sample: data?.[0] ?? null,
    })
  }

  return Response.json(data || [])
}
