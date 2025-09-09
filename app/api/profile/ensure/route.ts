// app/api/profile/ensure/route.ts
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

function getBearerToken(req: Request) {
  const h = req.headers.get('authorization') || req.headers.get('Authorization') || ''
  const m = /^Bearer\s+(.+)$/.exec(h)
  return m ? m[1] : null
}

export async function POST(req: Request) {
  try {
    const token = getBearerToken(req)
    if (!token) { return NextResponse.json({ ok: false, error: 'missing_token' }, { status: 401 }) }

    // 1) Obtener usuario a partir del token (cliente ANON con header Authorization)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) { return NextResponse.json({ ok:false, error:'missing_env' }, { status:500 }) }
    const userClient = createClient(url, anon, { global: { headers: { Authorization: 'Bearer ' + token } }, auth: { persistSession:false, autoRefreshToken:false } })
    const { data: userData, error: userErr } = await userClient.auth.getUser()
    if (userErr || !userData?.user) { return NextResponse.json({ ok:false, error:'invalid_token' }, { status:401 }) }
    const user: any = userData.user

    // 2) Upsert de perfil con Service Role (sin RLS)
    const admin = supabaseServer()
    const payload = {
      id: user.id,
      email: user.email ?? null,
      full_name: (user.user_metadata && user.user_metadata.full_name) ? user.user_metadata.full_name : null,
      account_type: (user.user_metadata && user.user_metadata.account_type) ? user.user_metadata.account_type : 'student',
      avatar_url: (user.user_metadata && user.user_metadata.avatar_url) ? user.user_metadata.avatar_url : null,
      updated_at: new Date().toISOString(),
    }
    const { error: upErr } = await admin.from('profiles').upsert(payload, { onConflict: 'id' })
    if (upErr) { return NextResponse.json({ ok:false, error:'upsert_failed', details: upErr.message }, { status:500 }) }

    return NextResponse.json({ ok: true, id: user.id })
  } catch (e: any) {
    return NextResponse.json({ ok:false, error:'exception', details: (e && e.message) ? e.message : String(e) }, { status:500 })
  }
}

export async function GET(req: Request) { return POST(req) }
