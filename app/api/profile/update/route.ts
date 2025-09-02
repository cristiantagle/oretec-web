import { createClient } from '@supabase/supabase-js'
import { supabaseServer } from '@/lib/supabase/server'

type AccountType = 'admin' | 'instructor' | 'company' | 'student'
type UpdateBody = {
  full_name?: string | null
  company_name?: string | null
  account_type?: string | null
  avatar_url?: string | null
  phone?: string | null
  rut?: string | null
  address?: string | null
  birth_date?: string | null // 'YYYY-MM-DD'
  nationality?: string | null
  profession?: string | null
}

export async function POST(req: Request) {
  try {
    const raw = req.headers.get('authorization') ?? req.headers.get('Authorization')
    if (!raw) {
      return new Response(JSON.stringify({ error: 'missing_bearer' }), { status: 401 })
    }
    const authHeader = raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`
    const token = authHeader.slice('Bearer '.length)

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) {
      return new Response(JSON.stringify({ error: 'missing_supabase_env' }), { status: 500 })
    }

    // Cliente "como usuario" (RLS)
    const supabase = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data: userData, error: userErr } = await supabase.auth.getUser()
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'invalid_session' }), { status: 401 })
    }
    const u = userData.user

    const body = (await req.json().catch(() => ({}))) as UpdateBody

    // Verificar si el solicitante es admin (con Service Role)
    const admin = supabaseServer()
    const { data: me, error: meErr } = await admin
    .from('profiles')
    .select('account_type')
    .eq('id', u.id)
    .maybeSingle()
    if (meErr) {
      return new Response(JSON.stringify({ error: 'DB error (role check)', detail: meErr.message }), { status: 500 })
    }
    const isAdmin = (me?.account_type ?? 'student') === 'admin'

    const allowedMap: Record<string, AccountType> = {
      admin: 'admin',
      instructor: 'instructor',
      company: 'company',
      student: 'student',
      empresa: 'company',
      instructora: 'instructor',
      individual: 'student',
    }

    const payload: Record<string, any> = { updated_at: new Date().toISOString() }
    if ('full_name' in body)    payload.full_name = body.full_name ?? null
      if ('company_name' in body) payload.company_name = body.company_name ?? null
        if ('avatar_url' in body)   payload.avatar_url = body.avatar_url ?? null
          if ('phone' in body)        payload.phone = body.phone ?? null
            if ('rut' in body)          payload.rut = body.rut ?? null
              if ('address' in body)      payload.address = body.address ?? null
                if ('nationality' in body)  payload.nationality = body.nationality ?? null
                  if ('profession' in body)   payload.profession = body.profession ?? null

                    if ('birth_date' in body) {
                      const bd = body.birth_date?.trim() || null
                      if (bd && !/^\d{4}-\d{2}-\d{2}$/.test(bd)) {
                        return new Response(JSON.stringify({ error: 'invalid_birth_date_format' }), { status: 400 })
                      }
                      payload.birth_date = bd
                    }

                    if ('account_type' in body) {
                      const atRaw = body.account_type?.toLowerCase() ?? null
                      const mapped = atRaw ? allowedMap[atRaw] : undefined

                      if (mapped) {
                        if (isAdmin) {
                          // Admin puede setear cualquier valor
                          payload.account_type = mapped
                        } else {
                          // No admin: puede elegir student/company/instructor, pero NO admin
                          if (mapped !== 'admin') {
                            payload.account_type = mapped
                          }
                          // Si intentó 'admin', lo ignoramos silenciosamente
                        }
                      }
                      // Si mapped no existe, ignoramos el campo
                    }

                    const { data, error } = await supabase
                    .from('profiles')
                    .update(payload)
                    .eq('id', u.id)
                    .select('*')
                    .maybeSingle()

                    if (error) {
                      return new Response(JSON.stringify({ error: 'DB error (update)', detail: error.message }), { status: 500 })
                    }
                    if (!data) {
                      return new Response(JSON.stringify({ error: 'not_found' }), { status: 404 })
                    }

                    return Response.json({ ok: true, profile: data })
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: 'unexpected', detail: e?.message || String(e) }),
                        { status: 500 },
    )
  }
}
