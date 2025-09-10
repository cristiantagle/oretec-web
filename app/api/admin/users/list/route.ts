import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(req: Request) {
  // Guard: requiere cookie admin_auth=1
  const isAdmin = cookies().get('admin_auth')?.value === '1'
  if (!isAdmin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const url = new URL(req.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
  const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') || '20', 10)))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  try {
    const supa = supabaseServer()
    const { data, error, count } = await supa
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      return NextResponse.json({ error: 'db_error', detail: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      page,
      pageSize,
      total: count ?? 0,
      items: data ?? [],
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'unexpected', detail: e?.message ?? String(e) }, { status: 500 })
  }
}
