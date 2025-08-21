import 'server-only'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Faltan envs de Supabase')
    return createClient(url, key)
}

export async function POST(req: Request) {
  try {
    const { orderId, note } = await req.json()
    if (!orderId) {
      return NextResponse.json({ error: 'orderId requerido' }, { status: 400 })
    }

    const sb = supabaseAdmin()
    const { error } = await sb
    .from('orders')
    .update({ status: 'failed', payment_notes: note ?? '' })
    .eq('id', orderId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Unknown server error' }, { status: 500 })
  }
}
