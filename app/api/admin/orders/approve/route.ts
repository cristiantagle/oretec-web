// app/api/admin/orders/approve/route.ts
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
      return NextResponse.json({
        ok: true,
        enrolled: false,
        note: 'Orden pagada, pero no se pudo leer para matricular.'
      })
    }

    const courseId = ordRow?.course_id
    const email = (ordRow?.user_email || '')?.trim().toLowerCase()
    const name = ordRow?.user_name || null

    if (!courseId || !email) {
      return NextResponse.json({
        ok: true,
        enrolled: false,
        note: 'Faltan course_id o user_email, no se pudo matricular.'
      })
    }

    // 3) UPSERT matrícula usando la restricción única (course_id, user_email)
    //    Requiere que exista el UNIQUE en BD:
    //    alter table public.enrollments add constraint enrollments_course_email_key unique (course_id, user_email);
    const { error: enErr } = await sb
    .from('enrollments')
    .upsert(
      {
        order_id: ordRow.id,
        course_id: courseId,
        user_email: email,
        user_name: name
      },
      { onConflict: 'course_id,user_email' } // evita duplicados
    )

    if (enErr) {
      return NextResponse.json({
        ok: true,
        enrolled: false,
        note: `Orden pagada. Error matriculación: ${enErr.message}`
      })
    }

    return NextResponse.json({ ok: true, enrolled: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Unknown server error' }, { status: 500 })
  }
}
