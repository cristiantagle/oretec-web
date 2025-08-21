import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { userId, courseId, paymentProof } = await req.json()
    if (!userId || !courseId || !paymentProof) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }
    const supabase = supabaseServer()

    const { data: course, error: cErr } = await supabase
      .from('courses').select('id').eq('id', courseId).single()
    if (cErr || !course) return NextResponse.json({ error: 'Curso no existe' }, { status: 400 })

    const { data: order, error: oErr } = await supabase
      .from('orders')
      .insert({ user_id: userId, course_id: courseId, status: 'pending_review', payment_proof: paymentProof })
      .select().single()
    if (oErr || !order) return NextResponse.json({ error: 'No se pudo crear la orden' }, { status: 400 })

    return NextResponse.json({ ok: true, orderId: order.id })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
