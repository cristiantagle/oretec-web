import { createClient } from '@supabase/supabase-js'
import { supabaseServer } from '@/lib/supabase/server'

type AccountType = 'admin' | 'instructor' | 'company' | 'student'

export async function POST(req: Request) {
  try {
    // 1) Validar sesión
    const raw = req.headers.get('authorization') ?? req.headers.get('Authorization')
    if (!raw) return new Response(JSON.stringify({ error: 'missing_bearer' }), { status: 401 })
      const authHeader = raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`
      const token = authHeader.slice('Bearer '.length)

      const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!anon || !projectUrl) {
        return new Response(JSON.stringify({ error: 'missing_supabase_env' }), { status: 500 })
      }

      const asUser = createClient(projectUrl, anon, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      })

      const { data: udata, error: uerr } = await asUser.auth.getUser()
      if (uerr || !udata?.user) {
        return new Response(JSON.stringify({ error: 'invalid_session' }), { status: 401 })
      }

      // 2) Verificar ADMIN con service role
      const admin = supabaseServer()
      const { data: me, error: meErr } = await admin
      .from('profiles')
      .select('id, account_type')
      .eq('id', udata.user.id)
      .maybeSingle()
      if (meErr) return new Response(JSON.stringify({ error: 'DB error', detail: meErr.message }), { status: 500 })
        if (!me || me.account_type !== 'admin') {
          return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403 })
        }

        // 2.5) Doble control: x-admin-token
        const headerToken = req.headers.get('x-admin-token') ?? ''
        const adminToken = process.env.ADMIN_TOKEN ?? ''
        if (!adminToken || headerToken !== adminToken) {
          return new Response(JSON.stringify({ error: 'admin_token_required' }), { status: 403 })
        }

        // 3) Parse body
        const body = (await req.json().catch(() => ({}))) as { user_id?: string; account_type?: string }
        const userId = (body.user_id || '').trim()
        const next = (body.account_type || '').toLowerCase() as AccountType

        const allowed: AccountType[] = ['student', 'company', 'instructor', 'admin']
        if (!userId) return new Response(JSON.stringify({ error: 'missing_user_id' }), { status: 400 })
          if (!allowed.includes(next)) return new Response(JSON.stringify({ error: 'invalid_account_type' }), { status: 400 })

            // 4) Update con service role (bypassa RLS)
            const { data, error } = await admin
            .from('profiles')
            .update({ account_type: next, updated_at: new Date().toISOString() })
            .eq('id', userId)
            .select('id, account_type, updated_at')
            .maybeSingle()

            if (error) {
              return new Response(JSON.stringify({ error: 'DB error (update)', detail: error.message }), {
                status: 500,
              })
            }
            if (!data) {
              return new Response(JSON.stringify({ error: 'not_found' }), { status: 404 })
            }

            return Response.json({ ok: true, profile: data })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'unexpected', detail: e?.message || String(e) }), { status: 500 })
  }
}
