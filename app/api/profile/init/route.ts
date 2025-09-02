import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/profile/init
 * Crea o actualiza el perfil del usuario autenticado con un payload mínimo y seguro.
 * - Requiere Authorization: Bearer <token de sesión del usuario>
 * - Respeta RLS (usa el cliente como el usuario)
 * - Idempotente (usa upsert por id)
 */
export async function POST(req: Request) {
    try {
        // 1) Authorization del usuario
        const raw = req.headers.get('authorization') ?? req.headers.get('Authorization')
        if (!raw) {
            return new Response(JSON.stringify({ error: 'missing_bearer' }), { status: 401 })
        }
        const authHeader = raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`
        const token = authHeader.slice('Bearer '.length)

        // 2) Cliente "como el usuario" (RLS aplica)
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        if (!url || !anon) {
            return new Response(JSON.stringify({ error: 'missing_supabase_env' }), { status: 500 })
        }
        const supabase = createClient(url, anon, {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { persistSession: false, autoRefreshToken: false },
        })

        // 3) Usuario autenticado
        const { data: userData, error: userErr } = await supabase.auth.getUser()
        if (userErr || !userData?.user) {
            return new Response(JSON.stringify({ error: 'invalid_session' }), { status: 401 })
        }
        const u = userData.user

        // 4) Email requerido por NOT NULL (según tu esquema)
        const email =
        (u.email as string | null | undefined) ??
        (u.user_metadata?.email as string | null | undefined) ??
        null
        if (!email) {
            return new Response(JSON.stringify({ error: 'no_email_in_session' }), { status: 400 })
        }

        // 5) Metadatos opcionales y mapeo de account_type a valores válidos
        const full_name_raw    = (u.user_metadata?.full_name ?? u.user_metadata?.name ?? null) as string | null
        const company_name_raw = (u.user_metadata?.company_name ?? null) as string | null
        const at_raw           = (u.user_metadata?.account_type ?? null) as string | null

        const allowed: Record<string, 'admin' | 'instructor' | 'company' | 'student'> = {
            admin: 'admin',
            instructor: 'instructor',
            company: 'company',
            student: 'student',
            // tolerancias comunes
            empresa: 'company',
            instructora: 'instructor',
        }
        const account_type = (at_raw && allowed[at_raw.toLowerCase()]) || 'student'

        // 6) Upsert mínimo (solo columnas existentes en tu BD)
        const payload: Record<string, any> = {
            id: u.id,
            email,
            updated_at: new Date().toISOString(),
        }
        if (full_name_raw    !== undefined) payload.full_name    = full_name_raw
            if (company_name_raw !== undefined) payload.company_name = company_name_raw
                if (account_type     !== undefined) payload.account_type = account_type

                    const { data, error: upsertErr } = await supabase
                    .from('profiles')
                    .upsert(payload, { onConflict: 'id' })
                    .select('*')
                    .single()

                    if (upsertErr) {
                        return new Response(
                            JSON.stringify({ error: 'DB error (upsert)', detail: upsertErr.message }),
                                            { status: 500 },
                        )
                    }

                    return Response.json({ ok: true, profile: data })
    } catch (e: any) {
        return new Response(
            JSON.stringify({ error: 'unexpected', detail: e?.message || String(e) }),
                            { status: 500 },
        )
    }
}
