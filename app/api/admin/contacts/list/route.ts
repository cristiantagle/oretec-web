import { supabaseServer } from '@/lib/supabase/server'
import { requireAdmin } from '../../testimonials/_auth'

export async function GET() {
  const unauth = requireAdmin()
  if (unauth) return unauth

  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from('contacts')
    .select('id, created_at, name, email, phone, company, message, status, archived, admin_notes')
    .order('created_at', { ascending: false })

  if (error) {
    return new Response(JSON.stringify({ error: 'DB error', detail: error.message }), { status: 500 })
  }
  return Response.json(data || [])
}
