import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    // 1) Bearer token del usuario
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'missing_bearer' }), { status: 401 })
    }
    const token = authHeader.slice('Bearer '.length)

    // 2) Cliente "como usuario"
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) {
      return new Response(JSON.stringify({ error: 'missing_supabase_env' }), { status: 500 })
    }
    const supabase = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    })

    // 3) Usuario
    const { data: userData, error: userErr } = await supabase.auth.getUser()
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'invalid_session' }), { status: 401 })
    }
    const u = userData.user

    // 4) Email requerido
    const email =
      (u.email as string | null | undefined) ??
      (u.user_metadata?.email as string | null | undefined) ??
      null
    if (!email) {
      return new Response(JSON.stringify({ error: 'no_email_in_session' }), { status: 400 })
    }

    // 5) Metadatos opcionales
    const full_name_raw    = (u.user_metadata?.full_name ?? u.user_metadata?.name ?? null) as string | null
    const company_name_raw = (u.user_metadata?.company_name ?? null) as string | null
    const at_raw           = (u.user_metadata?.account_type ?? null) as string | null

    // NUEVO: phone y avatar_url
    const phone_raw       = (u.user_metadata?.phone ?? null) as string | null
    const avatar_url_raw  = (u.user_metadata?.avatar_url ?? null) as string | null

    // Nuevos campos adicionales
    const rut_raw         = (u.user_metadata?.rut ?? null) as string | null
    const address_raw     = (u.user_metadata?.address ?? null) as string | null
    const birth_date_raw  = (u.user_metadata?.birth_date ?? null) as string | null // 'YYYY-MM-DD'
    const nationality_raw = (u.user_metadata?.nationality ?? null) as string | null
    const profession_raw  = (u.user_metadata?.profession ?? null) as string | null

    const allowed: Record<string, 'admin' | 'instructor' | 'company' | 'student'> = {
      admin: 'admin',
      instructor: 'instructor',
      company: 'company',
      student: 'student',
      empresa: 'company',
      instructora: 'instructor',
      individual: 'student',
    }
    const account_type = (at_raw && allowed[at_raw.toLowerCase()]) || 'student'

    // 6) ¿Existe?
    const { data: existing, error: selErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', u.id)
      .maybeSingle()
    if (selErr) {
      return new Response(JSON.stringify({ error: 'DB error (select)', detail: selErr.message }), { status: 500 })
    }

    // 7A) No existe → INSERT
    if (!existing) {
      const insertPayload: Record<string, any> = {
        id: u.id,
        email,
        updated_at: new Date().toISOString(),
      }
      if (full_name_raw)    insertPayload.full_name = full_name_raw
      if (company_name_raw) insertPayload.company_name = company_name_raw
      if (account_type)     insertPayload.account_type = account_type

      // NUEVO
      if (phone_raw)       insertPayload.phone = phone_raw
      if (avatar_url_raw)  insertPayload.avatar_url = avatar_url_raw

      if (rut_raw)         insertPayload.rut = rut_raw
      if (address_raw)     insertPayload.address = address_raw
      if (birth_date_raw)  insertPayload.birth_date = birth_date_raw
      if (nationality_raw) insertPayload.nationality = nationality_raw
      if (profession_raw)  insertPayload.profession = profession_raw

      const { data, error: insErr } = await supabase
        .from('profiles')
        .insert(insertPayload)
        .select('*')
        .single()
      if (insErr) {
        return new Response(JSON.stringify({ error: 'DB error (insert)', detail: insErr.message }), { status: 500 })
      }
      return Response.json({ ok: true, created: true, profile: data })
    }

    // 7B) Sí existe → NO pisar valores; solo rellenar nulls
    const patch: Record<string, any> = {}
    if (existing.email == null) patch.email = email
    if (existing.full_name == null && full_name_raw) patch.full_name = full_name_raw
    if (existing.account_type == null && account_type) patch.account_type = account_type
    if (existing.company_name == null && company_name_raw) patch.company_name = company_name_raw

    // NUEVO
    if (existing.phone == null && phone_raw) patch.phone = phone_raw
    if (existing.avatar_url == null && avatar_url_raw) patch.avatar_url = avatar_url_raw

    if (existing.rut == null && rut_raw) patch.rut = rut_raw
    if (existing.address == null && address_raw) patch.address = address_raw
    if (existing.birth_date == null && birth_date_raw) patch.birth_date = birth_date_raw
    if (existing.nationality == null && nationality_raw) patch.nationality = nationality_raw
    if (existing.profession == null && profession_raw) patch.profession = profession_raw

    if (Object.keys(patch).length > 0) {
      patch.updated_at = new Date().toISOString()
      const { data, error: updErr } = await supabase
        .from('profiles')
        .update(patch)
        .eq('id', u.id)
        .select('*')
        .single()
      if (updErr) {
        return new Response(JSON.stringify({ error: 'DB error (update ensure)', detail: updErr.message }), {
          status: 500,
        })
      }
      return Response.json({ ok: true, created: false, profile: data })
    }

    return Response.json({ ok: true, created: false, profile: existing })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'unexpected', detail: e?.message || String(e) }), { status: 500 })
  }
}
