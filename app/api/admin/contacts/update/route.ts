import { supabaseServer } from '@/lib/supabase/server'
import { requireAdmin } from '../../testimonials/_auth'

export async function POST(req: Request) {
  const unauth = requireAdmin()
  if (unauth) return unauth

  const body = await req.json().catch(() => ({}))
  const { id, status, archived, admin_notes } = body || {}
  if (!id) return new Response(JSON.stringify({ error: 'Falta id' }), { status: 400 })

  const allowed = ['new','in_progress','done']
  const update: Record<string, any> = {}
  if (typeof archived === 'boolean') update.archived = archived
  if (typeof admin_notes === 'string') update.admin_notes = admin_notes
  if (typeof status === 'string' && allowed.includes(status)) update.status = status

  if (!Object.keys(update).length) {
    return new Response(JSON.stringify({ error: 'Sin cambios' }), { status: 400 })
  }

  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from('contacts')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: 'DB error', detail: error.message }), { status: 500 })
  }
  return Response.json({ ok: true, contact: data })
}
