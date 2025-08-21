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
    const { orderId } = await req.json()
    if (!orderId) {
      return NextResponse.json({ error: 'orderId requerido' }, { status: 400 })
    }

    const sb = supabaseAdmin()

    // 1) Marcar orden como pagada
    const { error: upErr } = await sb
    .from('orders')
    .update({ status: 'paid' })
    .eq('id', orderId)

    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 })
    }

    // 2) Obtener datos de la orden para matricular
    const { data: ordRow, error: getErr } = await sb
    .from('orders')
    .select('id, user_email, user_name, course_id')
    .eq('id', orderId)
    .single()

    if (getErr) {
      // Si no podemos leer la orden, devolvemos éxito parcial (pagada) y explicamos
      return NextResponse.json({ ok: true, enrolled: false, note: 'Orden pagada, pero no se pudo leer para matricular.' })
    }

    const courseId = ordRow?.course_id
    const email = (ordRow?.user_email || '')?.trim().toLowerCase()
    const name = ordRow?.user_name || null

    if (!courseId || !email) {
      // No hay datos suficientes para matricular, pero la orden quedó pagada
      return NextResponse.json({ ok: true, enrolled: false, note: 'Faltan course_id o user_email, no se pudo matricular.' })
    }

    // 3) UPSERT matrícula para evitar duplicados
    //    Como definimos unique(course_id, user_email), insertamos y si existe ignoramos.
    const { error: enErr } = await sb
    .from('enrollments')
    .insert({
      order_id: ordRow.id,
      course_id: courseId,
      user_email: email,
      user_name: name
    }, { ignoreDuplicates: true })

    if (enErr) {
      // No bloqueamos la aprobación por un fallo de matrícula, solo informamos
      return NextResponse.json({ ok: true, enrolled: false, note: `Orden pagada. Error matriculación: ${enErr.message}` })
    }

    return NextResponse.json({ ok: true, enrolled: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Unknown server error' }, { status: 500 })
  }
}
